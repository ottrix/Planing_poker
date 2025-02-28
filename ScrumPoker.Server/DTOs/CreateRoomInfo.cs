namespace ScrumPoker.Server.DTOs
{
    public class CreateRoomInfo
    {
        public string RoomId { get; set; }
        public string? UserId { get; set; }
        public string SelectedCardSetId { get; set; }
    }
}
