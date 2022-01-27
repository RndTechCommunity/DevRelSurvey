using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Model
{
    public class SurveyService
    {
        private readonly SurveyDbContext dbContext;
        private readonly IntervieweesPreloader intervieweesPreloader;

        public SurveyService(SurveyDbContext dbContext, IntervieweesPreloader intervieweesPreloader)
        {
            this.dbContext = dbContext;
            this.intervieweesPreloader = intervieweesPreloader;
        }
        
        public async Task<IEnumerable<CompanyModel>> GetCompanyModels(
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            var interviewees = await GetFilteredInterviewees(intervieweesPreloader.CompanyModelInterviewees, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, professionFilter, programmingLanguageFilter, isCommunityFilter);

            var groupedAnswers = interviewees
                .SelectMany(i => i.CompanyAnswers)
                .GroupBy(
                    a => (a.Company.Name, a.Interviewee.Year),
                    a => new
                    {
                        Known = a.IsKnown || a.IsGood || a.IsWanted ? 1.0 : 0, 
                        Wanted = a.IsWanted ? 1.0 : 0,
                        Good = a.IsGood ? 1.0 : 0
                    })
                .Select(
                    g => new CompanyModel(Name: g.Key.Name,
                        Year: g.Key.Year,
                        KnownLevel: g.Sum(x => x.Known) / g.Count(),
                        GoodLevel: g.Sum(x => x.Good) / g.Count(),
                        WantedLevel: g.Sum(x => x.Wanted) / g.Count(),
                        Error: 0.0441));

            return groupedAnswers.ToArray();
        }

        public async Task<MetaModel> GetMeta(
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            var interviewees = await GetFilteredInterviewees(intervieweesPreloader.MetaInterviewees, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, professionFilter, programmingLanguageFilter, isCommunityFilter);
            var ci = interviewees.ToArray();
            
            var data = new Dictionary<string, MetaModelTableRow[]>();

            var total = new MetaModelTableRow("Всего",
                dbContext.Interviewees.Count(c => c.Year == 2019),
                dbContext.Interviewees.Count(c => c.Year == 2020),
                dbContext.Interviewees.Count(c => c.Year == 2021));
            var filtered = new MetaModelTableRow("Выбрано",
                ci.Count(c => c.Year == 2019),
                ci.Count(c => c.Year == 2020),
                ci.Count(c => c.Year == 2021));
            var meta = new MetaModel(total, filtered, data);
            
            // Теперь надо сделать по каждой группе выборку кого и сколько
			
            // Города cities
            data.Add("cities", ci
                .Select(i => (i.Year, i.City))
                .GroupBy(c => c.City)
                .Select(g => new MetaModelTableRow(g.Key,
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .OrderByDescending(r => r.Count2021)
                .Take(10)
                .ToArray());
			
            // Возраста ages
            data.Add("ages", ci
                .Select(i => (i.Year, i.Age))
                .GroupBy(c => c.Age / 5)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow($"{g.Key * 5} - {g.Key * 5 + 4}",
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			
            // Образование education
             data.Add("education", ci
                .Select(i => (i.Year, i.Education))
                .GroupBy(c => c.Education)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key.ToString(),
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
            
            // Уровни levels
            data.Add("levels", ci
                .Select(i => (i.Year, i.ProfessionLevel))
                .GroupBy(c => c.ProfessionLevel)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key.ToString(),
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			
            // Профессии professions
            data.Add("professions", ci
                .Select(i => (i.Year, i.Profession))
                .GroupBy(c => c.Profession)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key.ToString(),
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			
            // Языки программирования languages
            data.Add("languages", ci
                .SelectMany(i => i.Languages.Select(l => (i.Year, l.Language)))
                .GroupBy(g => g.Language.Name)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key,
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			
            // Ходит ли человек на митапы
            data.Add("isCommunity", ci
                .Select(i => (i.Year, i.IsCommunity))
                .GroupBy(c => c.IsCommunity)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key ? "Да" : "Нет",
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			
            // Откуда узнают информацию о компаниях
            data.Add("communitySource", ci
                .SelectMany(i => i.CommunitySources.Select(cs => (i.Year, cs.CommunitySource)))
                .GroupBy(g => g.CommunitySource.Name)
                .OrderBy(g => g.Key)
                .Select(g => new MetaModelTableRow(g.Key,
                    g.Count(c => c.Year == 2019),
                    g.Count(c => c.Year == 2020),
                    g.Count(c => c.Year == 2021)))
                .ToArray());
			   
            return meta;
        }

        private async Task<IEnumerable<Interviewee>> GetFilteredInterviewees(
            IEnumerable<Interviewee> interviewees,
            int[] agesFilter,
            string[] citiesFilter, 
            string[] educationFilter, 
            string[] experienceLevelFilter, 
            string[] professionFilter,
            string[] programmingLanguageFilter, 
            bool? isCommunityFilter)
        {
            if (agesFilter.Length != 0)
                interviewees = interviewees.Where(i => agesFilter.Contains(i.Age));
            if (citiesFilter.Length != 0)
                interviewees = interviewees.Where(i => citiesFilter.Contains(i.City));
            if (educationFilter.Length != 0)
                interviewees = interviewees.Where(i => educationFilter.Contains(i.Education));
            if (experienceLevelFilter.Length != 0)
                interviewees = interviewees.Where(i => experienceLevelFilter.Contains(i.ProfessionLevel));
            if (professionFilter.Length != 0)
                interviewees = interviewees.Where(i => professionFilter.Contains(i.Profession));
            if (programmingLanguageFilter.Length != 0)
            {
                var filteredIntervieweeIds = await dbContext
                    .IntervieweeLanguages
                    .Where(il => programmingLanguageFilter.Contains(il.Language.Name))
                    .Select(il => il.IntervieweeId)
                    .ToArrayAsync();
                
                interviewees = interviewees
                    .Join(filteredIntervieweeIds, 
                        i => i.Id, 
                        fi => fi, 
                        (interviewee, guid) => interviewee)
                    .DistinctBy(i => i.Id);
            }

            if (isCommunityFilter.HasValue)
                interviewees = interviewees.Where(i => i.VisitMeetups == isCommunityFilter.Value);
            
            return interviewees;
        }
    }
}