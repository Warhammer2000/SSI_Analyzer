using MediatR;

namespace SsiAnalyzer.Application.Features.Snapshots.Commands.CreateSnapshot;

public record CreateSnapshotCommand(
    DateTime RecordedAt,
    double EstablishBrand,
    double FindPeople,
    double EngageInsights,
    double BuildRelationships,
    double IndustryAverage,
    double NetworkAverage,
    int IndustryRankPercentile,
    int NetworkRankPercentile
) : IRequest<Guid>;
