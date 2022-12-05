using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class CommunitySourceEntityTypeConfiguration : IEntityTypeConfiguration<CommunitySource>
{
	public void Configure(EntityTypeBuilder<CommunitySource> builder)
	{
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Name).IsRequired();
	}
}
