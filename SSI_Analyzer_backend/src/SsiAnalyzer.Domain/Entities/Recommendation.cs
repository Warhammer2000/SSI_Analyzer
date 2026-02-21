namespace SsiAnalyzer.Domain.Entities;

public class Recommendation
{
    public Guid Id { get; set; }
    public Guid SnapshotId { get; set; }
    public string Component { get; set; } = string.Empty;
    public int Priority { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ActionStepsJson { get; set; } = "[]";
    public string? ExpectedImpact { get; set; }
    public string? TimeEstimate { get; set; }
    public bool IsCompleted { get; set; }

    public SsiSnapshot Snapshot { get; set; } = null!;
}
