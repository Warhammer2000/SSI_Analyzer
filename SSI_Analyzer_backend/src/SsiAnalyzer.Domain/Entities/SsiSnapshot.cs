namespace SsiAnalyzer.Domain.Entities;

public class SsiSnapshot
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime RecordedAt { get; set; }

    public double EstablishBrand { get; set; }
    public double FindPeople { get; set; }
    public double EngageInsights { get; set; }
    public double BuildRelationships { get; set; }

    public double TotalScore => EstablishBrand + FindPeople + EngageInsights + BuildRelationships;

    public double IndustryAverage { get; set; }
    public double NetworkAverage { get; set; }
    public int IndustryRankPercentile { get; set; }
    public int NetworkRankPercentile { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
}
