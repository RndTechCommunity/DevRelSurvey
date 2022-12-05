using Enyim.Caching;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public class GetCompanyModelsQueryHandler : FilteredIntervieweesQueryHandlerBase<GetCompanyModelsQuery, CompanyModel[]>
{
	public GetCompanyModelsQueryHandler(IIntervieweesDataProvider dataProvider, IMemcachedClient cache) 
		: base(dataProvider, cache)
	{
	}

	protected override CompanyModel[] HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers)
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
