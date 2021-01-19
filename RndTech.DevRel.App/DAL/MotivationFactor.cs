using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
	public class MotivationFactor
	{
		[Key]
		public Guid Id { get; set; }
        
		[Required]
		public string Name { get; set; }
		
		public ICollection<IntervieweeMotivationFactor> Interviewees { get; set; }
	}
}