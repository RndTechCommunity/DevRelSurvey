using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Model
{
    public static class SurveyService
    {
        public static async Task<IEnumerable<CompanyModel>> GetCompanyModels(
            SurveyDbContext dbContext,
            int year,
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            IQueryable<CompanyAnswer> answers = dbContext.CompanyAnswers;
            answers = answers.Where(a => a.Interviewee.Year == year);
            if(agesFilter.Length != 0)
                answers = answers.Where(a => agesFilter.Contains(a.Interviewee.Age));
            if(citiesFilter.Length != 0)
                answers = answers.Where(a => citiesFilter.Contains(a.Interviewee.City));
            if(educationFilter.Length != 0)
                answers = answers.Where(a => educationFilter.Contains(a.Interviewee.Education));
            if(experienceLevelFilter.Length != 0)
                answers = answers.Where(a => experienceLevelFilter.Contains(a.Interviewee.ProfessionLevel));
            if(professionFilter.Length != 0)
                answers = answers.Where(a => professionFilter.Contains(a.Interviewee.Profession));
            if(programmingLanguageFilter.Length != 0)
                answers = answers.Where(a => a.Interviewee.Languages.Select(l => l.Language.Name).Any(s => programmingLanguageFilter.Contains(s)));
            if (isCommunityFilter.HasValue)
                answers = answers.Where(a => a.Interviewee.VisitMeetups == isCommunityFilter.Value);

            var interviewees = await answers.Select(a => a.IntervieweeId).Distinct().CountAsync();
            var errorLevel = 0.0441 + (interviewees < 70 ? (interviewees < 50 ? (interviewees < 18 ? 0.05 : 0.03) : 0.01) : 0);
            
            var groupedAnswers = answers
                .GroupBy(
                    a => a.Company.Name,
                    a => new {Known = a.IsKnown || a.IsWanted ? 1.0 : 0, Wanted = a.IsWanted ? 1.0 : 0})
                .Select(
                    g => new CompanyModel
                    {
                        Name = g.Key, 
                        KnownLevel = g.Sum(x => x.Known) / g.Count(), 
                        WantedLevel = g.Sum(x => x.Wanted) / g.Count(),
                        Error = errorLevel
                    });

            return await groupedAnswers.ToArrayAsync();
        }

        public static async Task<MetaModel> GetMeta(
            SurveyDbContext dbContext, 
            int year,
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            IQueryable<Interviewee> interviewees = dbContext.Interviewees;
            interviewees = interviewees.Where(i => i.Year == year);
            if(agesFilter.Length != 0)
                interviewees = interviewees.Where(i => agesFilter.Contains(i.Age));
            if(citiesFilter.Length != 0)
                interviewees = interviewees.Where(i => citiesFilter.Contains(i.City));
            if(educationFilter.Length != 0)
                interviewees = interviewees.Where(i => educationFilter.Contains(i.Education));
            if(experienceLevelFilter.Length != 0)
                interviewees = interviewees.Where(i => experienceLevelFilter.Contains(i.ProfessionLevel));
            if(professionFilter.Length != 0)
                interviewees = interviewees.Where(i => professionFilter.Contains(i.Profession));
            if(programmingLanguageFilter.Length != 0)
                interviewees = interviewees.Where(i => i.Languages.Select(l => l.Language.Name).Any(s => programmingLanguageFilter.Contains(s)));
            if (isCommunityFilter.HasValue)
                interviewees = interviewees.Where(i => i.VisitMeetups == isCommunityFilter.Value);

            var ci = await interviewees
                .Include(i => i.Languages)
                .ThenInclude(il => il.Language)
                .Include(i => i.CommunitySources)
                .ThenInclude(cs => cs.CommunitySource)
                .Include(i => i.MotivationFactors)
                .ThenInclude(mf => mf.MotivationFactor)
                .ToArrayAsync();
            
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
            
            meta.count = interviewees.Count();
            meta.Total = dbContext.Interviewees.Count(i => i.Year == year);
            meta.sources = data;
            return meta;
        }
    }
}