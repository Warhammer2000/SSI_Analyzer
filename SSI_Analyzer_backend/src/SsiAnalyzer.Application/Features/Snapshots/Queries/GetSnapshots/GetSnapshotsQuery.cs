using MediatR;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetSnapshots;

public record GetSnapshotsQuery : IRequest<List<SsiSnapshot>>;
