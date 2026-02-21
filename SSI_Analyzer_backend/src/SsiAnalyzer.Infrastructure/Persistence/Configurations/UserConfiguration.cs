using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.LinkedInUrl).HasMaxLength(500);
        builder.Property(u => u.Industry).HasMaxLength(100);
        builder.Property(u => u.Role).HasMaxLength(100);
    }
}
