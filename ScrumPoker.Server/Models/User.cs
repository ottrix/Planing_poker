namespace ScrumPoker.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public bool IsLoggedIn { get; set; }
        public List<string> PermanentRoomLinks { get; set; } = new List<string>();    }
}
