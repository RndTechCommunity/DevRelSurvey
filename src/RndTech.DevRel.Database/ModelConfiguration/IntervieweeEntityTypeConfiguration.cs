using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class IntervieweeEntityTypeConfiguration : IEntityTypeConfiguration<Interviewee>
{
	public void Configure(EntityTypeBuilder<Interviewee> builder)
	{
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Age).IsRequired();
		builder.Property(e => e.Education).IsRequired();
		builder.Property(e => e.Profession).IsRequired();
		builder.Property(e => e.City).IsRequired();
		builder.Property(e => e.VisitMeetups).IsRequired();
		builder.Property(e => e.Year).IsRequired();
		builder.Property(e => e.IsCommunity).IsRequired();

		builder.HasIndex(i => i.Age);
		builder.HasIndex(i => i.Education);
		builder.HasIndex(i => i.Profession);
		builder.HasIndex(i => i.ProfessionLevel);
		builder.HasIndex(i => i.VisitMeetups);
		builder.HasIndex(i => i.Year);
	}
}
