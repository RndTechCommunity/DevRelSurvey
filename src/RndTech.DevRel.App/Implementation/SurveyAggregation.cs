using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation;

internal static class SurveyAggregation
{
	public static Dictionary<IntervieweeModel, AnswerModel[]> Filter(
		IEnumerable<KeyValuePair<IntervieweeModel, AnswerModel[]>> answers, IFilteredIntervieweesQuery query)
	{
		return answers
			.Where(kvp => query.Ages.Length == 0 || query.Ages.Contains(kvp.Key.Age))
			.Where(kvp => query.Cities.Length == 0 || query.Cities.Contains(kvp.Key.City))
			.Where(kvp => query.Educations.Length == 0 || query.Educations.Contains(kvp.Key.Education))
			.Where(kvp => query.Experiences.Length == 0 || query.Experiences.Contains(kvp.Key.ProfessionLevel))
			.Where(kvp => query.Professions.Length == 0 || query.Professions.Contains(kvp.Key.Profession))
			.Where(kvp =>
				query.ProgrammingLanguages.Length == 0 ||
				query.ProgrammingLanguages.Any(filterValue => kvp.Key.Languages.Contains(filterValue)))
			.Where(kvp => !query.IsCommunity.HasValue || query.IsCommunity.Value == kvp.Key.VisitMeetups)
			.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
	}

	public static CompanyModel[] Companies(IEnumerable<KeyValuePair<IntervieweeModel, AnswerModel[]>> filteredAnswers)
	{
		var groupedAnswers = filteredAnswers
			.SelectMany(kvp => kvp.Value.Select(a => (year: kvp.Key.Year, answer: a)))
			.GroupBy(
				a => (a.answer.CompanyName, a.year),
				a => new
				{
					Known = a.answer.IsKnown || a.answer.IsGood || a.answer.IsWanted ? 1.0 : 0,
					Wanted = a.answer.IsWanted ? 1.0 : 0,
					Good = a.answer.IsGood ? 1.0 : 0
				})
			.Select(
				g => new CompanyModel(Name: g.Key.CompanyName,
					Year: g.Key.year,
					KnownLevel: g.Sum(x => x.Known) / g.Count(),
					GoodLevel: g.Sum(x => x.Good) / g.Count(),
					WantedLevel: g.Sum(x => x.Wanted) / g.Count(),
					KnownVotes: (int) g.Sum(x => x.Known),
					GoodVotes: (int) g.Sum(x => x.Good),
					WantedVotes: (int) g.Sum(x => x.Wanted),
					SelectionCount: g.Count(),
					Error: 0.0441));

		return groupedAnswers.ToArray();
	}
}
