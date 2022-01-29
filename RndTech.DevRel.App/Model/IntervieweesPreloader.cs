using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Model
{
	public class IntervieweesPreloader
	{
		private static readonly object lockObject = new();
		private static List<Interviewee> companyModelInterviewees;
		private static List<Interviewee> metaInterviewees;

		public IEnumerable<Interviewee> CompanyModelInterviewees => companyModelInterviewees;

		public IEnumerable<Interviewee> MetaInterviewees => metaInterviewees;

		public IntervieweesPreloader(SurveyDbContext dbContext)
		{
			lock (lockObject)
			{
				try
				{
					if (companyModelInterviewees == null)
					{
						var interviewees = dbContext
							.Interviewees
							.ToList();

						foreach (var interviewee in interviewees)
						{
							interviewee.CompanyAnswers = dbContext
								.CompanyAnswers
								.AsNoTracking()
								.Where(ca => ca.IntervieweeId == interviewee.Id)
								.Include(ca => ca.Company)
								.ToArray();
						}

						companyModelInterviewees ??= interviewees;
					}

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
				catch (Exception ex)
				{
					Console.WriteLine(ex);
				}
			}
		}
	}
}