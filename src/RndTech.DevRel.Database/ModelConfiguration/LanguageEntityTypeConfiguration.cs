using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class LanguageEntityTypeConfiguration : IEntityTypeConfiguration<Language>
{
	public void Configure(EntityTypeBuilder<Language> builder)
	{
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Name).IsRequired();
	}
}
