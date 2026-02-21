using MediatR;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Analysis.Commands.GenerateAnalysis;

public record GenerateAnalysisCommand(Guid SnapshotId) : IRequest<List<Recommendation>>;
