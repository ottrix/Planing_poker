using Microsoft.AspNetCore.SignalR;
using ScrumPoker.Server.Hubs;
using System.Collections.Concurrent;

namespace ScrumPoker.Server.Managers
{
    public class PointsManager
    {
        private readonly IHubContext<PlanningHub> _hubContext;
        private readonly UserManager _userManager;
        private readonly VotingManager _votingManager;
        private readonly ILogger<PointsManager> _logger;
        private readonly ConcurrentDictionary<string, RoomState> _roomStates;


        public PointsManager(IHubContext<PlanningHub> hubContext, UserManager userManager, VotingManager votingManager, ILogger<PointsManager> logger, ConcurrentDictionary<string, RoomState> roomStates)
        {
            _hubContext = hubContext;
            _userManager = userManager;
            _votingManager = votingManager;
            _logger = logger;
            _roomStates = roomStates;
        }

        public async Task SelectStoryPoints(string roomId, string storyPoints, HubCallerContext context, string userId)
        {
            if (!_roomStates.ContainsKey(roomId))
            {
                _roomStates[roomId] = new RoomState();
            }

            if (!_roomStates[roomId].PointsSelection.ContainsKey(userId))
            {
                _roomStates[roomId].PointsSelection[userId] = storyPoints;
            }

            _votingManager.SelectStoryPoints(roomId, userId, storyPoints);
            await _hubContext.Clients.Group(roomId).SendAsync("UserSelectedPoints", userId, storyPoints);
        }

        public async Task RevealPoints(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                _logger.LogWarning("RevealPoints called with an empty roomId");
                return;
            }

            _logger.LogInformation("RevealPoints called for roomId: {RoomId}", roomId);
            var votes = _votingManager.GetVotes(roomId);

            if (votes == null || !votes.Any())
            {
                _logger.LogInformation("No votes found for roomId: {RoomId}", roomId);
            }
            else
            {
                _logger.LogInformation("Votes for roomId {RoomId}: {Votes}", roomId, string.Join(", ", votes.Select(v => $"{v.Key}: {v.Value}")));
            }

            if (!_roomStates.ContainsKey(roomId))
            {
                _roomStates[roomId] = new RoomState();
            }

            _roomStates[roomId].CanVote = false;

            var averagePoints = CalculateAveragePoints(votes);

            await _hubContext.Clients.Group(roomId).SendAsync("PointsRevealed", votes, averagePoints);
            await _hubContext.Clients.Group(roomId).SendAsync("UpdateCanVote", false);
        }

        public float CalculateAveragePoints(ConcurrentDictionary<string, string> votes)
        {
            if (votes == null || !votes.Any())
            {
                return 0;
            }

            var sumVotes = 0;
            var count = 0;
            foreach (var vote in votes)
            {
                if (int.TryParse(vote.Value, out var voteValue))
                {
                    sumVotes += voteValue;
                    count++;
                }
            }
            return count > 0 ? (float)sumVotes / count : 0;
        }

        public async Task ResetVoting(string roomId)
        {
            _votingManager.ResetVotes(roomId);
            _roomStates[roomId].PointsSelection.Clear();
            _roomStates[roomId].CanVote = true;
            await _hubContext.Clients.Group(roomId).SendAsync("VotingReset");
            await _hubContext.Clients.Group(roomId).SendAsync("UpdateCanVote", true);
        }
    }
}
