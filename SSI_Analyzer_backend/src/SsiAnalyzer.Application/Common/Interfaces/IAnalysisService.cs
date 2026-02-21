using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Common.Interfaces;

public interface IAnalysisService
{
    List<Recommendation> GenerateRecommendations(SsiSnapshot snapshot);
    List<ActionItem> GenerateActionItems(SsiSnapshot snapshot, Guid userId);
}
