using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class FilteredIntervieweesQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
	where TQuery : IFilteredIntervieweesQuery
{
	private readonly IIntervieweesDataProvider dataProvider;

	protected FilteredIntervieweesQueryHandlerBase(IIntervieweesDataProvider dataProvider)
	{
		this.dataProvider = dataProvider;
	}
	
	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct)
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

		return HandleInternal(answers, filteredAnswers);
	}

	protected abstract TResult HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers);
}
