using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Repositories;

public class CompanyRepository : ICompanyRepository
{
    private readonly IIntervieweesDataProvider dataProvider;

    public CompanyRepository(IIntervieweesDataProvider dataProvider)
    {
        this.dataProvider = dataProvider;
    }

    public Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var query = filter.ToFilteredQuery();
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