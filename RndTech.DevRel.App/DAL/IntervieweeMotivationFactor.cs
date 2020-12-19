using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RndTech.DevRel.App.DAL
{
	public class IntervieweeMotivationFactor
	{
		[Required, ForeignKey(nameof(Interviewee))]
		public Guid IntervieweeId { get; set; }
		public Interviewee Interviewee { get; set; }
        
		[Required, ForeignKey(nameof(MotivationFactor))]
		public Guid MotivationFactorId { get; set; }
		public MotivationFactor MotivationFactor { get; set; }
	}
}