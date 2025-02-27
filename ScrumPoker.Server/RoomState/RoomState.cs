namespace ScrumPoker
{
    public class RoomState
    {
        public List<User> Participants { get; set; } = new List<User>();
        public Dictionary<string, string> PointsSelection { get; set; } = new Dictionary<string, string>();
        public bool CanVote { get; set; } = true;
        public bool IsQuestPointsManegment { get; set; } = false;
        public string RoomName { get; set; } = string.Empty;
        public string SelectedCardSetId { get; set; }

        public void SetQuestPointsManegment(bool isQuestPointsManegment)
        {
            IsQuestPointsManegment = isQuestPointsManegment;
        }

        public void SetSelectedCardSetId(string selectedCardSetId)
        {
            SelectedCardSetId = selectedCardSetId;
        }
    }

    public class User
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
    }
}
