namespace SsiAnalyzer.Domain.Entities;

public class ActionItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Component { get; set; } = string.Empty;
    public string Task { get; set; } = string.Empty;
    public string? Frequency { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DueDate { get; set; }

    public User User { get; set; } = null!;
}
