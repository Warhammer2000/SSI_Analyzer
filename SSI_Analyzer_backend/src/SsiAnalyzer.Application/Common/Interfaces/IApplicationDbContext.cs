using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<SsiSnapshot> SsiSnapshots { get; }
    DbSet<Recommendation> Recommendations { get; }
    DbSet<ActionItem> ActionItems { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
