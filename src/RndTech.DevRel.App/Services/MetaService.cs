using RndTech.DevRel.App.Infrastructure;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

public class MetaService : IMetaService
{
    private readonly IIntervieweesDataProvider dataProvider;
    private readonly IFilteringService filteringService;

    public MetaService(IIntervieweesDataProvider dataProvider, IFilteringService filteringService)
    {
        this.dataProvider = dataProvider;
        this.filteringService = filteringService;
    }

    public Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var answers = dataProvider.GetAllIntervieweeAnswers();
        var filteredAnswers = filteringService.FilterIntervieweeAnswers(answers, filter);
        var filteredInterviewees = filteredAnswers.Keys.ToArray();

        var data = new Dictionary<string, MetaModelTableRow[]>();

        var total = new MetaModelTableRow("Всего",
            answers.Count(kvp => kvp.Key.Year == 2019),
            answers.Count(kvp => kvp.Key.Year == 2020),
            answers.Count(kvp => kvp.Key.Year == 2021),
            answers.Count(kvp => kvp.Key.Year == 2022));
        var filtered = new MetaModelTableRow("Выбрано",
            filteredInterviewees.Count(c => c.Year == 2019),
            filteredInterviewees.Count(c => c.Year == 2020),
            filteredInterviewees.Count(c => c.Year == 2021),
            filteredInterviewees.Count(c => c.Year == 2022));
        var meta = new MetaModel(total, filtered, data);

        // Города cities
        data.Add("cities", filteredInterviewees
            .Select(i => (i.Year, i.City))
            .GroupBy(c => c.City)
            .Select(g => new MetaModelTableRow(g.Key,
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .OrderByDescending(r => r.Count2021)
            .Take(10)
            .ToArray());

        // Возрасты ages
        data.Add("ages", filteredInterviewees
            .Select(i => (i.Year, i.Age))
            .GroupBy(c => c.Age / 5)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow($"{g.Key * 5} - {g.Key * 5 + 4}",
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Образование education
        data.Add("education", filteredInterviewees
            .Select(i => (i.Year, i.Education))
            .GroupBy(c => c.Education)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key.ToString(),
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Уровни levels
        data.Add("levels", filteredInterviewees
            .Select(i => (i.Year, i.ProfessionLevel))
            .GroupBy(c => c.ProfessionLevel)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key.ToString(),
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Профессии professions
        data.Add("professions", filteredInterviewees
            .Select(i => (i.Year, i.Profession))
            .GroupBy(c => c.Profession)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key.ToString(),
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Языки программирования languages
        data.Add("languages", filteredInterviewees
            .SelectMany(i => i.Languages.Select(languageName => (i.Year, languageName)))
            .GroupBy(g => g.languageName)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key,
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Ходит ли человек на митапы
        data.Add("isCommunity", filteredInterviewees
            .Select(i => (i.Year, i.VisitMeetups))
            .GroupBy(c => c.VisitMeetups)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key ? "Да" : "Нет",
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        // Откуда узнают информацию о компаниях
        data.Add("communitySource", filteredInterviewees
            .SelectMany(i => i.CommunitySources.Select(communitySource => (i.Year, communitySource)))
            .GroupBy(g => g.communitySource)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key,
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());

        return Task.FromResult(meta);
    }
}