using Enyim.Caching;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class FilteredIntervieweesQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
	where TQuery : IFilteredIntervieweesQuery
{
	private readonly IIntervieweesDataProvider dataProvider;
	private readonly IMemcachedClient cache;

	protected FilteredIntervieweesQueryHandlerBase(IIntervieweesDataProvider dataProvider, IMemcachedClient cache)
	{
		this.dataProvider = dataProvider;
		this.cache = cache;
	}
	
	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct)
	{
		return await cache.GetValueOrCreateAsync(GetCacheKey(GetType().ToString(), query), AppSettings.CacheSeconds,
			()
				=>
			{
				var answers = dataProvider.GetAllIntervieweeAnswers();

				var filteredAnswers = answers
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

				return Task.FromResult(HandleInternal(answers, filteredAnswers));
			});
		
	}

	private static string GetCacheKey(string methodName, TQuery filter) =>
		$"{methodName}_{string.Join(',', filter.Cities)}_{string.Join(',', filter.Educations)}_{string.Join(',', filter.ProgrammingLanguages)}_{string.Join(',', filter.Professions)}_{string.Join(',', filter.Experiences)}_{string.Join(',', filter.Ages)}_{string.Join(',', filter.IsCommunity)}"
			.Replace(" ", "");

	protected abstract TResult HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers);
}
