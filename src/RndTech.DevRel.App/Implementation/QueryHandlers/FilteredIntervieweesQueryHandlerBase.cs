using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class FilteredIntervieweesQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
	where TQuery : IFilteredIntervieweesQuery
{
	private readonly IIntervieweesDataProvider dataProvider;
	private readonly IDistributedCache cache;

	protected FilteredIntervieweesQueryHandlerBase(IIntervieweesDataProvider dataProvider, IDistributedCache cache)
	{
		this.dataProvider = dataProvider;
		this.cache = cache;
	}
	
	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct)
	{
		return await cache.GetValueOrCreateAsync(GetCacheKey(GetType().ToString(), query),
			()
				=>
			{
				var answers = dataProvider.GetAllIntervieweeAnswers();

				var filteredAnswers = SurveyAggregation.Filter(answers, query);

				return Task.FromResult(HandleInternal(answers, filteredAnswers));
			});
		
	}

	private static string GetCacheKey(string methodName, TQuery filter) =>
		$"Data2022_{methodName}_{string.Join(',', filter.Cities)}_{string.Join(',', filter.Educations)}_{string.Join(',', filter.ProgrammingLanguages)}_{string.Join(',', filter.Professions)}_{string.Join(',', filter.Experiences)}_{string.Join(',', filter.Ages)}_{string.Join(',', filter.IsCommunity)}"
			.Replace(" ", "");

	protected abstract TResult HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers);
}
