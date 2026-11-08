using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public class GetCompanyModelsQueryHandler : FilteredIntervieweesQueryHandlerBase<GetCompanyModelsQuery, CompanyModel[]>
{
	public GetCompanyModelsQueryHandler(IIntervieweesDataProvider dataProvider, IDistributedCache cache) 
		: base(dataProvider, cache)
	{
	}

	protected override CompanyModel[] HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers)
		=> SurveyAggregation.Companies(filteredAnswers);
}
