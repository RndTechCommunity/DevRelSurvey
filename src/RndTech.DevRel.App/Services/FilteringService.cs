using System.Collections.ObjectModel;
using RndTech.DevRel.App.Filtering;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

/// <summary>
/// Сервис фильтрации данных интервьюируемых.
/// </summary>
public class FilteringService : IFilteringService
{
    private readonly FilterValueConverter converter;

    public FilteringService(FilterValueConverter converter)
    {
        this.converter = converter;
    }

    public IEnumerable<IntervieweeModel> FilterInterviewees(
        IEnumerable<IntervieweeModel> interviewees,
        UserFilter filter)
    {
        var convertedFilter = converter.Convert(filter);
        var specification = new IntervieweeFilterSpecification(convertedFilter);
        var compiledExpression = specification.ToExpression().Compile();

        return interviewees.Where(compiledExpression);
    }

    public IDictionary<IntervieweeModel, AnswerModel[]> FilterIntervieweeAnswers(
        ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> answers,
        UserFilter filter)
    {
        var convertedFilter = converter.Convert(filter);
        var specification = new IntervieweeAnswerFilterSpecification(convertedFilter);
        var compiledExpression = specification.ToExpression().Compile();

        return answers.Where(compiledExpression).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
    }
}