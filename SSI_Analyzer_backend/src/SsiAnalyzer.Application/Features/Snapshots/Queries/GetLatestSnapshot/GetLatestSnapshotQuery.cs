using MediatR;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetLatestSnapshot;

public record GetLatestSnapshotQuery : IRequest<SsiSnapshot?>;
