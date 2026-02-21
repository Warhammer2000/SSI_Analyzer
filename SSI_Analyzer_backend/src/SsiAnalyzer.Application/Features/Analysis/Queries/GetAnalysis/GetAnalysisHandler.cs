using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Analysis.Queries.GetAnalysis;

public class GetAnalysisHandler : IRequestHandler<GetAnalysisQuery, List<Recommendation>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetAnalysisHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<Recommendation>> Handle(GetAnalysisQuery request, CancellationToken cancellationToken)
    {
        return await _db.Recommendations
            .Where(r => r.SnapshotId == request.SnapshotId && r.Snapshot.UserId == _currentUser.UserId!.Value)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }
}
