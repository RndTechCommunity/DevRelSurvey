using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class IntervieweeLanguageEntityTypeConfiguration : IEntityTypeConfiguration<IntervieweeLanguage>
{
	public void Configure(EntityTypeBuilder<IntervieweeLanguage> builder)
	{
		builder.HasKey(e => new { e.IntervieweeId, e.LanguageId });
		
		builder
			.HasOne(e => e.Interviewee)
			.WithMany(e => e.Languages)
			.HasForeignKey(e => e.IntervieweeId);

		builder
			.HasOne(e => e.Language)
			.WithMany(e => e.Interviewees)
			.HasForeignKey(e => e.LanguageId);
	}
}
