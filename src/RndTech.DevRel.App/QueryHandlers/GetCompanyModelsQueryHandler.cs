using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Queries;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetCompanyModelsQueryHandler : IQueryHandler<GetCompanyModelsQuery, CompanyModel[]>
{
    private readonly IIntervieweesDataProvider dataProvider;

    public GetCompanyModelsQueryHandler(IIntervieweesDataProvider dataProvider)
    {
        this.dataProvider = dataProvider;
    }

    public Task<CompanyModel[]> HandleAsync(GetCompanyModelsQuery query, CancellationToken cancellationToken = default)
    {
        var filter = query.Filter.ToFilteredQuery();
        var answers = dataProvider.GetAllIntervieweeAnswers();

        var filteredAnswers = answers
            .Where(kvp => filter.Ages.Length == 0 || filter.Ages.Contains(kvp.Key.Age))
            .Where(kvp => filter.Cities.Length == 0 || filter.Cities.Contains(kvp.Key.City))
            .Where(kvp => filter.Educations.Length == 0 || filter.Educations.Contains(kvp.Key.Education))
            .Where(kvp => filter.Experiences.Length == 0 || filter.Experiences.Contains(kvp.Key.ProfessionLevel))
            .Where(kvp => filter.Professions.Length == 0 || filter.Professions.Contains(kvp.Key.Profession))
            .Where(kvp =>
                filter.ProgrammingLanguages.Length == 0 ||
                filter.ProgrammingLanguages.Any(filterValue => kvp.Key.Languages.Contains(filterValue)))
            .Where(kvp => !filter.IsCommunity.HasValue || filter.IsCommunity.Value == kvp.Key.VisitMeetups)
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

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

        return Task.FromResult(groupedAnswers.ToArray());
    }
}