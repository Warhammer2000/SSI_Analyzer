using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetLatestSnapshot;

public class GetLatestSnapshotHandler : IRequestHandler<GetLatestSnapshotQuery, SsiSnapshot?>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetLatestSnapshotHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<SsiSnapshot?> Handle(GetLatestSnapshotQuery request, CancellationToken cancellationToken)
    {
        return await _db.SsiSnapshots
            .Include(s => s.Recommendations)
            .Where(s => s.UserId == _currentUser.UserId!.Value)
            .OrderByDescending(s => s.RecordedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
