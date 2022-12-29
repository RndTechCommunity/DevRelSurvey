using Enyim.Caching;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public class GetMetaQueryHandler : FilteredIntervieweesQueryHandlerBase<GetMetaQuery, MetaModel>
{
    public GetMetaQueryHandler(IIntervieweesDataProvider dataProvider, IMemcachedClient cache) 
        : base(dataProvider, cache)
	{
	}

	protected override MetaModel HandleInternal(IDictionary<IntervieweeModel, AnswerModel[]> answers, IDictionary<IntervieweeModel, AnswerModel[]> filteredAnswers)
	{
		var ci = filteredAnswers.Select(kvp => kvp.Key).ToArray();
        
        var data = new Dictionary<string, MetaModelTableRow[]>();

        var total = new MetaModelTableRow("Всего",
			answers.Count(kvp => kvp.Key.Year == 2019),
			answers.Count(kvp => kvp.Key.Year == 2020),
			answers.Count(kvp => kvp.Key.Year == 2021),
            answers.Count(kvp => kvp.Key.Year == 2022));
        var filtered = new MetaModelTableRow("Выбрано",
            ci.Count(c => c.Year == 2019),
            ci.Count(c => c.Year == 2020),
            ci.Count(c => c.Year == 2021),
            ci.Count(c => c.Year == 2022));
        var meta = new MetaModel(total, filtered, data);
            
        // Теперь надо сделать по каждой группе выборку кого и сколько
			
        // Города cities
        data.Add("cities", ci
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
        data.Add("ages", ci
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
        data.Add("education", ci
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
        data.Add("levels", ci
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
        data.Add("professions", ci
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
        data.Add("languages", ci
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
        data.Add("isCommunity", ci
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
        data.Add("communitySource", ci
            .SelectMany(i => i.CommunitySources.Select(communitySource => (i.Year, communitySource)))
            .GroupBy(g => g.communitySource)
            .OrderBy(g => g.Key)
            .Select(g => new MetaModelTableRow(g.Key,
                g.Count(c => c.Year == 2019),
                g.Count(c => c.Year == 2020),
                g.Count(c => c.Year == 2021),
                g.Count(c => c.Year == 2022)))
            .ToArray());
			   
        return meta;
	}
}
