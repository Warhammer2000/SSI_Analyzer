using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Actions.Queries.GetActions;

public class GetActionsHandler : IRequestHandler<GetActionsQuery, List<ActionItem>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetActionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<ActionItem>> Handle(GetActionsQuery request, CancellationToken cancellationToken)
    {
        return await _db.ActionItems
            .Where(a => a.UserId == _currentUser.UserId!.Value)
            .OrderBy(a => a.Component)
            .ThenBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }
}
