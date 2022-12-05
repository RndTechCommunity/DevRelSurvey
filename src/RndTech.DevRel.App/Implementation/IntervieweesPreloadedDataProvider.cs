using System.Collections.ObjectModel;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation;

public class IntervieweesPreloadedDataProvider : IIntervieweesDataProvider
{
	private Dictionary<IntervieweeModel, AnswerModel[]> CachedAnswers { get; }

	public IntervieweesPreloadedDataProvider(IDbContextFactory<SurveyDbContext> dbContextFactory)
	{
		var db = dbContextFactory.CreateDbContext();
		var interviewees = db
			.Interviewees
			.AsNoTracking()
			.Select(i => new IntervieweeModel(i.Id, 
				i.Age,
				i.Education,
				i.Profession,
				i.ProfessionLevel,
				i.City,
				i.VisitMeetups || i.IsCommunity,
				i.Year,
				i.Languages.Select(il => il.Language.Name).ToArray(),
				i.CommunitySources.Select(cs => cs.CommunitySource.Name).ToArray()))
			.ToArray();

		var answers = db
			.CompanyAnswers
			.AsNoTracking()
			.Select(ca => new AnswerModel(ca.IntervieweeId, ca.Company.Name, ca.IsKnown, ca.IsGood, ca.IsWanted))
			.ToArray();
		
		var groupedAnswers = answers
			.GroupBy(a => a.IntervieweeId)
			.ToDictionary(a => a.Key, a => a.ToArray());
		
		CachedAnswers =
			interviewees.ToDictionary(i => i, i => groupedAnswers[i.Id]);
	}

	public IntervieweeModel[] GetAllInterviewees()
	{
		return CachedAnswers.Keys.ToArray();
	}

	public ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> GetAllIntervieweeAnswers()
	{
		return CachedAnswers.AsReadOnly();
	}
}