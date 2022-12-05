using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class CompanyAnswerEntityTypeConfiguration : IEntityTypeConfiguration<CompanyAnswer>
{
	public void Configure(EntityTypeBuilder<CompanyAnswer> builder)
	{
		builder.HasKey(e => e.Id);
		builder.Property(e => e.IsKnown).IsRequired();
		builder.Property(e => e.IsGood).IsRequired();
		builder.Property(e => e.IsWanted).IsRequired();
		
		builder
			.HasOne(e => e.Interviewee)
			.WithMany(e => e.CompanyAnswers)
			.HasForeignKey(e => e.IntervieweeId);
		builder
			.HasOne(e => e.Company)
			.WithMany(e => e.Answers)
			.HasForeignKey(e => e.CompanyId);
	}
}
