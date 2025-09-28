using RndTech.DevRel.App.Infrastructure;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

public class CompanyService : ICompanyService
{
    private readonly IIntervieweesDataProvider dataProvider;
    private readonly IFilteringService filteringService;

    public CompanyService(IIntervieweesDataProvider dataProvider, IFilteringService filteringService)
    {
        this.dataProvider = dataProvider;
        this.filteringService = filteringService;
    }

    public Task<CompanyModel[]> GetCompaniesAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var answers = dataProvider.GetAllIntervieweeAnswers();
        var filteredAnswers = filteringService.FilterIntervieweeAnswers(answers, filter);

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