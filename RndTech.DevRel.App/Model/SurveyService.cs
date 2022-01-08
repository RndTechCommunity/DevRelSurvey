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
            int year,
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            var interviewees = await GetFilteredInterviewees(intervieweesPreloader.CompanyModelInterviewees, year, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, professionFilter, programmingLanguageFilter, isCommunityFilter);
            
            var groupedAnswers = interviewees
                .SelectMany(i => i.CompanyAnswers)
                .GroupBy(
                    a => a.Company.Name,
                    a => new {Known = a.IsKnown || a.IsWanted ? 1.0 : 0, Wanted = a.IsWanted ? 1.0 : 0})
                .Select(
                    g => new CompanyModel
                    {
                        Name = g.Key, 
                        KnownLevel = g.Sum(x => x.Known) / g.Count(), 
                        WantedLevel = g.Sum(x => x.Wanted) / g.Count(),
                        Error = 0.0441
                    });

            return groupedAnswers.ToArray();
        }

        public async Task<MetaModel> GetMeta(
            int year,
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            var interviewees = await GetFilteredInterviewees(intervieweesPreloader.MetaInterviewees, year, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, professionFilter, programmingLanguageFilter, isCommunityFilter);
            var ci = interviewees.ToArray();
            var meta = new MetaModel();
            var data = new Dictionary<string, Dictionary<string, int>>();
            
            // Теперь надо сделать по каждой группе выборку кого и сколько
			// Города cities
			data.Add("cities", ci.Select(i => i.City).GroupBy(c => c).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Возраста ages
			data.Add("ages", ci.Select(i => i.Age).GroupBy(c => c / 5).OrderBy(c => c.Key).ToDictionary(kvp => $"{kvp.Key * 5} - {kvp.Key * 5 + 4}", kvp => kvp.Count()));
			// Образование education
			data.Add("education", ci.Select(i => i.Education).GroupBy(c => c).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Уровни levels
			data.Add("levels", ci.Select(i => i.ProfessionLevel).GroupBy(c => c).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Профессии professions
			data.Add("professions", ci.Select(i => i.Profession).GroupBy(c => c).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Языки программирования languages
			data.Add("languages", ci.SelectMany(i => i.Languages).GroupBy(c => c.Language.Name).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Ходит ли человек на митапы
			data.Add("isCommunity", ci.Select(i => i.IsCommunity).GroupBy(c => c).OrderByDescending(c => c.Key).ToDictionary(kvp => kvp.Key == true ? "Да" : "Нет", kvp => kvp.Count()));
			// Откуда узнают информацию о компаниях
			//data.Add("companySources", interviewees.SelectMany(i => i.FirstOrDefault()?.CompanySources).GroupBy(c => c).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Критерии выбора компаний
            data.Add("motivationFactors", ci.SelectMany(i => i.MotivationFactors).GroupBy(c => c.MotivationFactor.Name).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
            // Откуда узнают информацию о митапах
			data.Add("communitySource", ci.SelectMany(i => i.CommunitySources).GroupBy(c => c.CommunitySource.Name).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
            
            meta.count = ci.Length;
            meta.Total = dbContext.Interviewees.Count(i => i.Year == year);
            meta.sources = data;
            return meta;
        }

        private async Task<IEnumerable<Interviewee>> GetFilteredInterviewees(
            IEnumerable<Interviewee> interviewees,
            int year, 
            int[] agesFilter,
            string[] citiesFilter, 
            string[] educationFilter, 
            string[] experienceLevelFilter, 
            string[] professionFilter,
            string[] programmingLanguageFilter, 
            bool? isCommunityFilter)
        {
            interviewees = interviewees.Where(i => i.Year == year);
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