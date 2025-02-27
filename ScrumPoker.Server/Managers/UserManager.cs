using Microsoft.AspNetCore.SignalR;
using ScrumPoker.Server.Hubs;
using System.Collections.Concurrent;

namespace ScrumPoker.Server.Managers
{
    public class UserManager
    {
        private readonly IHubContext<PlanningHub> _hubContext;
        private static ConcurrentDictionary<string, string> _usernames = new ConcurrentDictionary<string, string>();
        private static ConcurrentDictionary<string, string> _userRoom = new ConcurrentDictionary<string, string>();
        public UserManager(IHubContext<PlanningHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SetName(string userId, string username, HubCallerContext context)
        {
            if (string.IsNullOrEmpty(username))
            {
                await _hubContext.Clients.Client(userId).SendAsync("NameSet", "Username cannot be empty");
                return;
            }

            if (string.IsNullOrEmpty(userId))
            {
                await _hubContext.Clients.Client(userId).SendAsync("NameSet", "UserId cannot be empty");
                return;
            }

            _usernames[userId] = username;
            await _hubContext.Clients.Client(userId).SendAsync("NameSet", username);
        }


        public string GetUserName(string userId)
        {   
            return _usernames.ContainsKey(userId) ? _usernames[userId] : "Unknown user";
        }

        public void CacheUser(string userId, string username)
        {
            _usernames[userId] = username;
        }

        public void RemoveUserFromCache(string userId)
        {
            _usernames.TryRemove(userId, out _);
            _userRoom.TryRemove(userId, out _);
        }

        public void SetUserRoom(string userId, string roomId)
        {
            _userRoom[userId] = roomId;
        }

        public string GetUserRoom(string userId)
        {
            return _userRoom.ContainsKey(userId) ? _userRoom[userId] : string.Empty;
        }

        public void RemoveUserRoom(string userId)
        {
            _userRoom.TryRemove(userId, out _);
        }

        public string getUserName(string userId)
        {
            return _usernames[userId]; 
        }
    }
}
