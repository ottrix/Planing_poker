using System.Collections.Concurrent;

namespace ScrumPoker.Server.Managers
{
    public class VotingManager
    {
        private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _roomVotes = new ();
        private readonly ConcurrentDictionary<string, RoomState> _roomStates;

        public VotingManager(ConcurrentDictionary<string, RoomState> roomStates)
        {
            _roomStates = roomStates;
        }

        public void SelectStoryPoints(string roomId, string userId, string storyPoints)
        {
            if (!_roomVotes.ContainsKey(roomId))
            {
                _roomVotes[roomId] = new ConcurrentDictionary<string, string>();
            }

            _roomVotes[roomId][userId] = storyPoints;
        }

        public ConcurrentDictionary<string, string> GetVotes(string roomId)
        {
            return _roomVotes.ContainsKey(roomId) ? _roomVotes[roomId] : new ConcurrentDictionary<string, string>();
        }

        public void ResetVotes(string roomId)
        {
            if (_roomVotes.ContainsKey(roomId))
            {
                _roomVotes[roomId].Clear();
            }

            if (_roomStates.ContainsKey(roomId))
            {
                _roomStates[roomId].PointsSelection.Clear();
            }
        }
    }
}
