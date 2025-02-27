using Microsoft.AspNetCore.SignalR;
using ScrumPoker.Server.Models;
using ScrumPoker.Server.Hubs;

namespace ScrumPoker.Server.Managers
{
    public class RoomManager
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<PlanningHub> _hubContext;
        private readonly UserManager _userManager;
        private static Dictionary<string, HashSet<UserRoomModel>> _roomUsers = new Dictionary<string, HashSet<UserRoomModel>>();

        public RoomManager(ApplicationDbContext context, IHubContext<PlanningHub> hubContext, UserManager userManager)
        {
            _context = context;
            _hubContext = hubContext;
            _userManager = userManager;
        }

        public async Task<string> CreateRoom(string userId, string roomName, string selectedCardSetId, HubCallerContext context, string? roomId = null)
        {
            var currentRoomId = _userManager.GetUserRoom(userId);
            if (!string.IsNullOrEmpty(currentRoomId))
            {
                var existingRoom = await _context.Rooms.FindAsync(Guid.Parse(currentRoomId));
                if (existingRoom != null && existingRoom.OwnerId == userId)
                {
                    await JoinRoom(existingRoom.Id, userId, _userManager.GetUserName(userId), context);
                    return existingRoom.Id.ToString();
                }
                else if (existingRoom == null)
                {
                    _userManager.RemoveUserRoom(userId);
                }
                else
                {
                    await _hubContext.Clients.Client(context.ConnectionId).SendAsync("Error", "You can only create one room at a time.");
                    return string.Empty;
                }
            }

            try
            {
                Room room;
                if (string.IsNullOrEmpty(roomId))
                {
                    room = new Room
                    {
                        Id = Guid.NewGuid(),
                        Name = roomName,
                        OwnerId = userId,
                        SelectedCardSetId = selectedCardSetId
                    };
                    _context.Rooms.Add(room);
                }
                else
                {
                    room = await _context.Rooms.FindAsync(Guid.Parse(roomId));
                    if (room == null)
                    {
                        room = new Room
                        {
                            Id = Guid.Parse(roomId),
                            Name = roomName,
                            OwnerId = userId,
                            SelectedCardSetId = selectedCardSetId
                        };
                        _context.Rooms.Add(room);
                    }
                }
                await _context.SaveChangesAsync();

                Console.WriteLine($"User {userId} created room {room.Id}");
                await _hubContext.Groups.AddToGroupAsync(context.ConnectionId, room.Id.ToString());
                if (!_roomUsers.ContainsKey(room.Id.ToString()))
                {
                    _roomUsers[room.Id.ToString()] = new HashSet<UserRoomModel>();
                }
                var username = _userManager.GetUserName(userId);
                if (!_roomUsers[room.Id.ToString()].Any(u => u.UserId == userId))
                {
                    _roomUsers[room.Id.ToString()].Add(new UserRoomModel { UserId = userId, UserName = username });
                }

                // Notify the client to update the user list
                await _hubContext.Clients.Group(room.Id.ToString()).SendAsync("UpdateUserList", _roomUsers[room.Id.ToString()]);

                return room.Id.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating room: {ex.Message}");
                await _hubContext.Clients.Client(context.ConnectionId).SendAsync("Error", "Error creating room");
                return string.Empty;
            }
        }

        public async Task JoinRoom(Guid roomId, string userId, string username, HubCallerContext context)
        {
            var room = await _context.FindAsync<Room>(roomId);

            if (room != null)
            {
                if (_roomUsers.ContainsKey(roomId.ToString()) && _roomUsers[roomId.ToString()].Count >= 25)
                {
                    await _hubContext.Clients.Client(context.ConnectionId).SendAsync("Error", "Room is full.");
                    return;
                }

                Console.WriteLine($"User {context.ConnectionId} is joining existing room {roomId}");
                await _userManager.SetName(userId, username, context);
                await JoinExistingRoom(roomId.ToString(), userId, username, context);

                // Informowanie użytkownika o wybranym zestawie kart
                await _hubContext.Clients.Client(context.ConnectionId).SendAsync("SelectedCardSet", room.SelectedCardSetId);
            }
            else
            {
                Console.WriteLine($"Room {roomId} does not exist.");
                await _hubContext.Clients.Client(context.ConnectionId).SendAsync("Error", "Room does not exist.");
            }
        }

        public async Task JoinExistingRoom(string roomId, string userId, string username, HubCallerContext context)
        {
            await _hubContext.Groups.AddToGroupAsync(context.ConnectionId, roomId);

            if (!_roomUsers.ContainsKey(roomId))
            {
                _roomUsers[roomId] = new HashSet<UserRoomModel>();
            }

            if (!_roomUsers[roomId].Any(u => u.UserId == userId))
            {
                var user = new UserRoomModel { UserId = userId, UserName = username };
                _roomUsers[roomId].Add(user);
            }

            await _hubContext.Clients.Client(context.ConnectionId).SendAsync("UpdateUserList", _roomUsers[roomId]);
            await _hubContext.Clients.Group(roomId).SendAsync("UserJoined", userId, username);
        }

        public async Task LeaveRoom(string roomId, string userId, HubCallerContext context)
        {
            Console.WriteLine($"User {userId} is leaving room {roomId}");
            await _hubContext.Groups.RemoveFromGroupAsync(context.ConnectionId, roomId);

            if (_roomUsers.ContainsKey(roomId))
            {
                var user = _roomUsers[roomId].FirstOrDefault(u => u.UserId == userId);
                if (user != null)
                {
                    _roomUsers[roomId].Remove(user);
                    Console.WriteLine($"User {userId} removed from room {roomId}");
                    await _hubContext.Clients.Group(roomId).SendAsync("UserLeft", userId);
                }
                else
                {
                    Console.WriteLine($"User {userId} not found in room {roomId}");
                }
            }
            else
            {
                Console.WriteLine($"Room {roomId} not found");
            }

            var room = await _context.Rooms.FindAsync(Guid.Parse(roomId));
            if (room != null)
            {
                if (room.OwnerId == userId)
                {
                    Console.WriteLine($"Owner {userId} left the room {roomId}. Enabling guest point management.");
                    await _hubContext.Clients.Group(roomId).SendAsync("EnableGuestPointManagement");
                }

                if (_roomUsers.ContainsKey(roomId) && _roomUsers[roomId].Count == 0)
                {
                    _roomUsers.Remove(roomId);
                    Console.WriteLine($"Room {roomId} removed from database");
                }
                else
                {
                    await _hubContext.Clients.Group(roomId).SendAsync("UpdateUserList", _roomUsers[roomId]);
                }
            }

            _userManager.RemoveUserRoom(userId);
        }

        public async Task<Room?> GetRoomById(Guid roomId)
        {
            return await _context.Rooms.FindAsync(roomId);
        }
    }
}