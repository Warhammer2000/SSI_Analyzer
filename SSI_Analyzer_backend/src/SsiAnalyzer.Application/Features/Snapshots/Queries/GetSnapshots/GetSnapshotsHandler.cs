using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetSnapshots;

public class GetSnapshotsHandler : IRequestHandler<GetSnapshotsQuery, List<SsiSnapshot>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetSnapshotsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<SsiSnapshot>> Handle(GetSnapshotsQuery request, CancellationToken cancellationToken)
    {
        return await _db.SsiSnapshots
            .Where(s => s.UserId == _currentUser.UserId!.Value)
            .OrderByDescending(s => s.RecordedAt)
            .ToListAsync(cancellationToken);
    }
}
