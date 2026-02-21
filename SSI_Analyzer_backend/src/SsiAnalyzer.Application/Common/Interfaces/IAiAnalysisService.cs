using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Common.Interfaces;

public interface IAiAnalysisService
{
    Task<List<Recommendation>> GeneratePersonalizedRecommendationsAsync(
        SsiSnapshot snapshot,
        string? industry,
        string? role,
        CancellationToken ct = default);
}
