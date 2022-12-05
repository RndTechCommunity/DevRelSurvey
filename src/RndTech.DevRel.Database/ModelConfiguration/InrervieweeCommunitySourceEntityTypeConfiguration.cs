using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database.ModelConfiguration;

public class IntervieweeCommunitySourceEntityTypeConfiguration : IEntityTypeConfiguration<IntervieweeCommunitySource>
{
	public void Configure(EntityTypeBuilder<IntervieweeCommunitySource> builder)
	{
		builder.HasKey(e => new { e.IntervieweeId, e.CommunitySourceId });
		
		builder
			.HasOne(e => e.Interviewee)
			.WithMany(e => e.CommunitySources)
			.HasForeignKey(e => e.IntervieweeId);
		
		builder
			.HasOne(e => e.CommunitySource)
			.WithMany(e => e.Interviewees)
			.HasForeignKey(e => e.CommunitySourceId);
	}
}
