using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<SsiSnapshot> SsiSnapshots => Set<SsiSnapshot>();
    public DbSet<Recommendation> Recommendations => Set<Recommendation>();
    public DbSet<ActionItem> ActionItems => Set<ActionItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
