using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RndTech.DevRel.App.DAL
{
	public class IntervieweeCommunitySource
	{
		[Required, ForeignKey(nameof(Interviewee))]
		public Guid IntervieweeId { get; set; }
		public Interviewee Interviewee { get; set; }
		
		[Required, ForeignKey(nameof(CommunitySource))]
		public Guid CommunitySourceId { get; set; }
		public CommunitySource CommunitySource { get; set; }
	}
}