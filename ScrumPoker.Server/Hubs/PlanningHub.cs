using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using ScrumPoker.Server.DTOs;
using ScrumPoker.Server.Managers;
using System.Collections.Concurrent;

namespace ScrumPoker.Server.Hubs
{
    public class PlanningHub : Hub
    {
        private readonly UserManager _userManager;
        private readonly RoomManager _roomManager;
        private readonly PointsManager _pointsManager;
        private readonly ILogger<PlanningHub> _logger;
        private static ConcurrentDictionary<string, RoomState>? _roomStates;

        public PlanningHub(UserManager userManager, RoomManager roomManager, PointsManager pointsManager, ConcurrentDictionary<string, RoomState> roomStates, ILogger<PlanningHub> logger)
        {
            _userManager = userManager;
            _roomManager = roomManager;
            _pointsManager = pointsManager;
            _roomStates = roomStates ?? new ConcurrentDictionary<string, RoomState>();
            _logger = logger;
        }

        private string? GetRoomId()
        {
            return Context.Items["roomId"]?.ToString();
        }

        private string? GetUserId()
        {
            return Context.Items["userId"]?.ToString();
        }

        public string GenerateUserId()
        {
            return Guid.NewGuid().ToString();
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async Task SelectStoryPoints(string roomId, string userId, string storyPoints)
        {
            if (string.IsNullOrEmpty(roomId) || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(storyPoints))
            {
                throw new ArgumentException("Invalid arguments for SelectStoryPoints");
            }

            await _pointsManager.SelectStoryPoints(roomId, storyPoints, Context, userId);
            await Clients.Group(roomId).SendAsync("UserSelectedPoints", userId, storyPoints);
        }

        public async Task RevealPoints()
        {
            var roomId = GetRoomId();
            if (!string.IsNullOrEmpty(roomId))
            {
                await _pointsManager.RevealPoints(roomId);
            }
        }

        public async Task JoinRoom(string roomId, string username, string userId)
        {
            Context.Items["roomId"] = roomId;
            Context.Items["userId"] = userId;
            _logger.LogInformation($"JoinRoom called with roomId: {roomId}, username: {username}, userId: {userId}");
            _userManager.SetUserRoom(userId, roomId);

            if (string.IsNullOrEmpty(roomId))
            {
                return;
            }
            await _roomManager.JoinRoom(Guid.Parse(roomId), userId, username, Context);

            if (_roomStates.ContainsKey(roomId))
            {
                var roomInfo = new RoomInfo
                {
                    IsQuestPointsManegment = _roomStates[roomId].IsQuestPointsManegment,
                    RoomName = _roomStates[roomId].RoomName,
                    SelectedCardSetId = _roomStates[roomId].SelectedCardSetId
                };
                await Clients.Caller.SendAsync("SetRoomInfo", roomInfo);

                _logger.LogInformation($"IsQuestPointsMangement is Set for: {_roomStates[roomId].IsQuestPointsManegment}");
            }

            _logger.LogInformation($"User {userId} joined room {roomId}");
        }

        public async Task<CreateRoomInfo> CreateRoom(string userId, string roomName, string selectedCardSetId, bool isQuestPointsManegment, string? roomId = null)
        {
            var RoomInfo = new CreateRoomInfo();

            var currentRoomId = _userManager.GetUserRoom(userId);
            if (!string.IsNullOrEmpty(currentRoomId))
            {
                // Sprawdź, czy użytkownik jest właścicielem istniejącego pokoju
                var existingRoom = await _roomManager.GetRoomById(Guid.Parse(currentRoomId));
                if (existingRoom != null && existingRoom.OwnerId == userId)
                {
                    // Dołącz użytkownika do istniejącego pokoju
                    await JoinRoom(currentRoomId, _userManager.GetUserName(userId), userId);
                    RoomInfo.RoomId = currentRoomId;
                    return RoomInfo;
                }
                else if (existingRoom == null)
                {
                    // Pokój został zniszczony, pozwól na utworzenie nowego pokoju
                    _userManager.RemoveUserRoom(userId);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", "You can only create one room at a time.");
                    return null;
                }
            }

            try
            {
                roomId = await _roomManager.CreateRoom(userId, roomName, selectedCardSetId, Context, roomId);
                Context.Items["roomId"] = roomId;
                Context.Items["userId"] = userId;

                _roomStates[roomId] = new RoomState();
                _roomStates[roomId].SetQuestPointsManegment(isQuestPointsManegment);
                _roomStates[roomId].SetSelectedCardSetId(selectedCardSetId); // Ustawienie selectedCardSetId

                if (!string.IsNullOrEmpty(userId))
                {
                    var userName = _userManager.GetUserName(userId);
                    var user = new User { UserId = userId, UserName = userName };

                    _roomStates[roomId].Participants.Add(user);
                    await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                    await Clients.Group(roomId).SendAsync("UserJoined", userId, userName);
                    await Clients.Group(roomId).SendAsync("UpdateUserList", _roomStates[roomId].Participants);
                }

                RoomInfo.RoomId = roomId;
                return RoomInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating room");
                await Clients.Caller.SendAsync("Error", "Error creating room");
                return null;
            }
        }

        public async Task LeaveRoom(string roomId, string userId)
        {
            _logger.LogInformation("LeaveRoom called with roomId: {RoomId}", roomId);

            try
            {
                await _roomManager.LeaveRoom(roomId, userId, Context);
                if (_roomStates.ContainsKey(roomId))
                {
                    if (!string.IsNullOrEmpty(userId))
                    {
                        for (int i = _roomStates[roomId].Participants.Count - 1; i >= 0; i--)
                        {
                            if (_roomStates[roomId].Participants[i].UserId == userId)
                            {
                                _roomStates[roomId].Participants.RemoveAt(i);
                                _logger.LogInformation("User {UserId} left room {RoomId}", userId, roomId);
                                _roomStates[roomId].PointsSelection.Remove(userId);
                                await Clients.Group(roomId).SendAsync("UserLeft", userId);
                                //await Clients.Group(roomId).SendAsync("UpdateUserList", _roomStates[roomId].Participants);
                                break;
                            }
                        }
                    }

                    if (_roomStates[roomId].Participants.Count == 0)
                    {
                        _roomStates.TryRemove(roomId, out _);
                        _userManager.RemoveUserRoom(userId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while leaving room with roomId: {RoomId}", roomId);
                throw;
            }
        }

        public async Task SetName(string userId, string username)
        {
            await _userManager.SetName(userId, username, Context);
        }

        public void CacheUser(string userId, string username)
        {
            _userManager.CacheUser(userId, username);
        }

        public async Task ResetVoting()
        {
            var roomId = GetRoomId();
            if (!string.IsNullOrEmpty(roomId))
            {
                await _pointsManager.ResetVoting(roomId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var roomId = GetRoomId();
            var userId = GetUserId();

            if (!string.IsNullOrEmpty(userId))
            {
                var username = _userManager.GetUserName(userId);
                _logger.LogInformation($"User with username: {username}, userId: {userId} disconnected from room {roomId}");

                if (!string.IsNullOrEmpty(roomId))
                {
                    await LeaveRoom(roomId, userId);
                }

                //_userManager.RemoveUserRoom(userId);
            }
            else
            {
                _logger.LogWarning("UserId is null or empty in OnDisconnectedAsync");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
