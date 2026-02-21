using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;

namespace SsiAnalyzer.Application.Features.Actions.Queries.GetStreak;

public class GetStreakHandler : IRequestHandler<GetStreakQuery, StreakResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetStreakHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<StreakResult> Handle(GetStreakQuery request, CancellationToken cancellationToken)
    {
        var completedActions = await _db.ActionItems
            .Where(a => a.UserId == _currentUser.UserId!.Value && a.IsCompleted && a.CompletedAt != null)
            .Select(a => a.CompletedAt!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync(cancellationToken);

        var totalCompleted = await _db.ActionItems
            .CountAsync(a => a.UserId == _currentUser.UserId!.Value && a.IsCompleted, cancellationToken);

        int streak = 0;
        var today = DateTime.UtcNow.Date;

        foreach (var date in completedActions)
        {
            if (date == today.AddDays(-streak) || date == today.AddDays(-streak - 1))
            {
                if (date == today.AddDays(-streak))
                    streak++;
                else if (streak == 0 && date == today.AddDays(-1))
                    streak++;
                else
                    break;
            }
            else
            {
                break;
            }
        }

        return new StreakResult(streak, totalCompleted);
    }
}
