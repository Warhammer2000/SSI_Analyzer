namespace SsiAnalyzer.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? LinkedInUrl { get; set; }
    public string? Industry { get; set; }
    public string? Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SsiSnapshot> Snapshots { get; set; } = new List<SsiSnapshot>();
    public ICollection<ActionItem> ActionItems { get; set; } = new List<ActionItem>();
}
