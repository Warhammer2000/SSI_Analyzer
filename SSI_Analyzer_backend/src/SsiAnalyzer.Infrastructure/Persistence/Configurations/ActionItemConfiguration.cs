using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Persistence.Configurations;

public class ActionItemConfiguration : IEntityTypeConfiguration<ActionItem>
{
    public void Configure(EntityTypeBuilder<ActionItem> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Component).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Task).HasMaxLength(500).IsRequired();
        builder.Property(a => a.Frequency).HasMaxLength(20);
        builder.HasIndex(a => a.UserId);

        builder.HasOne(a => a.User)
            .WithMany(u => u.ActionItems)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
