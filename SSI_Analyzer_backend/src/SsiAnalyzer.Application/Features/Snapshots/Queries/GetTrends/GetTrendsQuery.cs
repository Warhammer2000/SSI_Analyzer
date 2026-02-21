using MediatR;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetTrends;

public record GetTrendsQuery : IRequest<List<TrendDataPoint>>;

public record TrendDataPoint(
    DateTime Date,
    double TotalScore,
    double EstablishBrand,
    double FindPeople,
    double EngageInsights,
    double BuildRelationships,
    double? Delta
);
