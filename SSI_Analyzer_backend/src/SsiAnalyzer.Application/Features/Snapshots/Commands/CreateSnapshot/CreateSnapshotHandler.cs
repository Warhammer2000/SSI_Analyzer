using MediatR;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Snapshots.Commands.CreateSnapshot;

public class CreateSnapshotHandler : IRequestHandler<CreateSnapshotCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSnapshotHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateSnapshotCommand request, CancellationToken cancellationToken)
    {
        var snapshot = new SsiSnapshot
        {
            Id = Guid.NewGuid(),
            UserId = _currentUser.UserId!.Value,
            RecordedAt = request.RecordedAt,
            EstablishBrand = request.EstablishBrand,
            FindPeople = request.FindPeople,
            EngageInsights = request.EngageInsights,
            BuildRelationships = request.BuildRelationships,
            IndustryAverage = request.IndustryAverage,
            NetworkAverage = request.NetworkAverage,
            IndustryRankPercentile = request.IndustryRankPercentile,
            NetworkRankPercentile = request.NetworkRankPercentile
        };

        _db.SsiSnapshots.Add(snapshot);
        await _db.SaveChangesAsync(cancellationToken);
        return snapshot.Id;
    }
}
