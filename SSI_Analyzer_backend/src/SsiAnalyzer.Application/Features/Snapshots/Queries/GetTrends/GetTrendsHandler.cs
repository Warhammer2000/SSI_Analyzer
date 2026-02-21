using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;

namespace SsiAnalyzer.Application.Features.Snapshots.Queries.GetTrends;

public class GetTrendsHandler : IRequestHandler<GetTrendsQuery, List<TrendDataPoint>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTrendsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<TrendDataPoint>> Handle(GetTrendsQuery request, CancellationToken cancellationToken)
    {
        var snapshots = await _db.SsiSnapshots
            .Where(s => s.UserId == _currentUser.UserId!.Value)
            .OrderBy(s => s.RecordedAt)
            .ToListAsync(cancellationToken);

        var result = new List<TrendDataPoint>();
        for (int i = 0; i < snapshots.Count; i++)
        {
            var s = snapshots[i];
            double? delta = i > 0 ? s.TotalScore - snapshots[i - 1].TotalScore : null;
            result.Add(new TrendDataPoint(
                s.RecordedAt,
                s.TotalScore,
                s.EstablishBrand,
                s.FindPeople,
                s.EngageInsights,
                s.BuildRelationships,
                delta
            ));
        }
        return result;
    }
}
