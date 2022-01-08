using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Model
{
	public class IntervieweesPreloader
	{
		private static readonly object lockObject = new object();
		private static List<Interviewee> companyModelInterviewees;
		private static List<Interviewee> metaInterviewees;

		public IEnumerable<Interviewee> CompanyModelInterviewees => companyModelInterviewees;
		public IEnumerable<Interviewee> MetaInterviewees => metaInterviewees;

		public IntervieweesPreloader(SurveyDbContext dbContext)
		{
			lock (lockObject)
			{
				companyModelInterviewees ??= dbContext
					.Interviewees
					.AsNoTracking()
					.Include(i => i.CompanyAnswers)
					.ThenInclude(ca => ca.Company)
					.AsEnumerable()
					.DistinctBy(i => i.Id)
					.ToList();

				
				metaInterviewees ??= dbContext
					.Interviewees
					.AsNoTracking()
					.Include(i => i.Languages)
					.ThenInclude(il => il.Language)
					.Include(i => i.CommunitySources)
					.ThenInclude(cs => cs.CommunitySource)
					.Include(i => i.MotivationFactors)
					.ThenInclude(mf => mf.MotivationFactor)
					.AsEnumerable()
					.DistinctBy(i => i.Id)
					.ToList();
			}
		}
	}
}