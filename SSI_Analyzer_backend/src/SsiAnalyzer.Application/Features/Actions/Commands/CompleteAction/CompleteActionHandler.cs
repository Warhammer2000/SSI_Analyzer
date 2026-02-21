using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;

namespace SsiAnalyzer.Application.Features.Actions.Commands.CompleteAction;

public class CompleteActionHandler : IRequestHandler<CompleteActionCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CompleteActionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteActionCommand request, CancellationToken cancellationToken)
    {
        var action = await _db.ActionItems
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == _currentUser.UserId!.Value, cancellationToken);

        if (action is null)
            throw new KeyNotFoundException("Action item not found");

        action.IsCompleted = !action.IsCompleted;
        action.CompletedAt = action.IsCompleted ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync(cancellationToken);
    }
}
