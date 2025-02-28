public class Room
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Link { get; set; }
    public bool HasAds { get; set; }
    public string? UserId { get; set; }
    public string? OwnerId { get; set; }
    public string SelectedCardSetId { get; set; }
}
