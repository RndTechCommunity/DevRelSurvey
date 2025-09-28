using System.Linq.Expressions;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Filtering;

/// <summary>
/// Спецификация фильтра для Interviewee.
/// </summary>
public class IntervieweeFilterSpecification : IFilterSpecification<IntervieweeModel>
{
    private readonly FilteredIntervieweesQuery filter;

    public IntervieweeFilterSpecification(FilteredIntervieweesQuery filter)
    {
        this.filter = filter;
    }

    public Expression<Func<IntervieweeModel, bool>> ToExpression()
    {
        var builder = new FilterExpressionBuilder<IntervieweeModel>();

        if (filter.Ages.Length > 0)
            builder.And(i => filter.Ages.Contains(i.Age));

        if (filter.Cities.Length > 0)
            builder.And(i => filter.Cities.Contains(i.City));

        if (filter.Educations.Length > 0)
            builder.And(i => filter.Educations.Contains(i.Education));

        if (filter.Experiences.Length > 0)
            builder.And(i => filter.Experiences.Contains(i.ProfessionLevel));

        if (filter.Professions.Length > 0)
            builder.And(i => filter.Professions.Contains(i.Profession));

        if (filter.ProgrammingLanguages.Length > 0)
            builder.And(i => filter.ProgrammingLanguages.Any(lang => i.Languages.Contains(lang)));

        if (filter.IsCommunity.HasValue)
            builder.And(i => i.VisitMeetups == filter.IsCommunity.Value);

        return builder.Build();
    }
}