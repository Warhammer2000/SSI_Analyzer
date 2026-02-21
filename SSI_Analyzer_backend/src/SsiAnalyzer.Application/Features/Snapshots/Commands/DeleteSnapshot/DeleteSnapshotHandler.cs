using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;

namespace SsiAnalyzer.Application.Features.Snapshots.Commands.DeleteSnapshot;

public class DeleteSnapshotHandler : IRequestHandler<DeleteSnapshotCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteSnapshotHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteSnapshotCommand request, CancellationToken cancellationToken)
    {
        var snapshot = await _db.SsiSnapshots
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.UserId == _currentUser.UserId!.Value, cancellationToken);

        if (snapshot is null)
            throw new KeyNotFoundException("Snapshot not found");

        _db.SsiSnapshots.Remove(snapshot);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
