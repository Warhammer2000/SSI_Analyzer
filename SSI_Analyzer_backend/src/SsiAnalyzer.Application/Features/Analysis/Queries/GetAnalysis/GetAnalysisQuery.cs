using MediatR;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Analysis.Queries.GetAnalysis;

public record GetAnalysisQuery(Guid SnapshotId) : IRequest<List<Recommendation>>;
