using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Persistence.Configurations;

public class SsiSnapshotConfiguration : IEntityTypeConfiguration<SsiSnapshot>
{
    public void Configure(EntityTypeBuilder<SsiSnapshot> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Ignore(s => s.TotalScore);
        builder.HasIndex(s => new { s.UserId, s.RecordedAt });

        builder.HasOne(s => s.User)
            .WithMany(u => u.Snapshots)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Recommendations)
            .WithOne(r => r.Snapshot)
            .HasForeignKey(r => r.SnapshotId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
