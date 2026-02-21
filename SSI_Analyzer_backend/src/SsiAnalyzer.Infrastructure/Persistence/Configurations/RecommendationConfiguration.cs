using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Persistence.Configurations;

public class RecommendationConfiguration : IEntityTypeConfiguration<Recommendation>
{
    public void Configure(EntityTypeBuilder<Recommendation> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Component).HasMaxLength(50).IsRequired();
        builder.Property(r => r.Title).HasMaxLength(200).IsRequired();
        builder.Property(r => r.Description).HasMaxLength(2000);
        builder.Property(r => r.ActionStepsJson).HasColumnType("text");
        builder.Property(r => r.ExpectedImpact).HasMaxLength(200);
        builder.Property(r => r.TimeEstimate).HasMaxLength(100);
    }
}
