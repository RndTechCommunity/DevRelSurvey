using System.Linq.Expressions;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Filtering;

/// <summary>
/// Спецификация фильтра для пары IntervieweeModel-AnswerModel[].
/// </summary>
public class IntervieweeAnswerFilterSpecification : IFilterSpecification<KeyValuePair<IntervieweeModel, AnswerModel[]>>
{
    private readonly FilteredIntervieweesQuery filter;

    public IntervieweeAnswerFilterSpecification(FilteredIntervieweesQuery filter)
    {
        this.filter = filter;
    }

    public Expression<Func<KeyValuePair<IntervieweeModel, AnswerModel[]>, bool>> ToExpression()
    {
        var builder = new FilterExpressionBuilder<KeyValuePair<IntervieweeModel, AnswerModel[]>>();

        if (filter.Ages.Length > 0)
            builder.And(kvp => filter.Ages.Contains(kvp.Key.Age));

        if (filter.Cities.Length > 0)
            builder.And(kvp => filter.Cities.Contains(kvp.Key.City));

        if (filter.Educations.Length > 0)
            builder.And(kvp => filter.Educations.Contains(kvp.Key.Education));

        if (filter.Experiences.Length > 0)
            builder.And(kvp => filter.Experiences.Contains(kvp.Key.ProfessionLevel));

        if (filter.Professions.Length > 0)
            builder.And(kvp => filter.Professions.Contains(kvp.Key.Profession));

        if (filter.ProgrammingLanguages.Length > 0)
            builder.And(kvp => filter.ProgrammingLanguages.Any(lang => kvp.Key.Languages.Contains(lang)));

        if (filter.IsCommunity.HasValue)
            builder.And(kvp => kvp.Key.VisitMeetups == filter.IsCommunity.Value);

        return builder.Build();
    }
}