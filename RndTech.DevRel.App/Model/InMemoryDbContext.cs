using CsvHelper;
using CsvHelper.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	public static class InMemoryDbContext
	{
		private static List<CompanyScore> _scores = new List<CompanyScore>();

		public static List<string> GetCities() => _scores.Select(s => s.City).GroupBy(c => c).Where(g => g.Count() > 5).Select(g => g.Key).Distinct().ToList();
		public static List<string> GetEducations() => _scores.Select(s => s.Education).Distinct().ToList();
		public static List<string> GetExperienceLevels() => _scores.Select(s => s.ExperienceLevel).Distinct().ToList();
		public static List<string> GetProfessions() => _scores.Select(s => s.Profession).Distinct().ToList();
		public static List<string> GetProgrammingLanguages() => _scores.SelectMany(s => s.ProgrammingLanguages).Distinct().OrderBy(l => l).ToList();
		public static List<string> GetCompanySources() => _scores.SelectMany(s => s.CompanySources).Distinct().ToList();
		public static List<string> GetCommunitySources() => _scores.SelectMany(s => s.CommunitySource).Distinct().ToList();

		public static void AddCsv(string filePath)
		{
			using (var reader = new StreamReader(filePath))
			using (var csv = new CsvReader(reader, new Configuration() { BadDataFound = null, Delimiter = "," }))
			{
				while (csv.Read())
				{
					var companies = csv.GetField<string>(22).Split("\n");
					foreach (var company in companies)
					{
						var cs = company.Split(":");
						var companyScore = new CompanyScore
						{
							IntervieweeId = csv.GetField<int>(0),
							CompanyName = cs[0].Trim('"'),
							IsKnown = cs[1].Trim().StartsWith("Знаю") || cs[1].Trim().Equals("Слышал"),
							IsWanted = cs[1].Trim().Equals("Знаю и хочу работать") || cs[1].Trim().Equals("Знаю и уважаю"),
							Age = csv.GetField<int>(8),
							City = csv.GetField<string>(7),
							Education = csv.GetField<string>(9),
							ExperienceLevel = csv.GetField<string>(11),
							ExperienceYears = csv.GetField<int>(10),
							Profession = csv.GetField<string>(12),
							ProgrammingLanguages = csv.GetField<string>(13).Split(",").Select(l => l.Trim()).ToList(),
							CompanySources = csv.GetField<string>(15).Split(",").Select(l => l.Trim()).ToList(),
							IsCommunity = csv.GetField<string>(18) == "Да",
							CommunitySource = csv.GetField<string>(19).Split(",").Select(l => l.Trim()).ToList(),
						};

						_scores.Add(companyScore);
					}
				}
			}
		}

		public static MetaModel GetMeta(
			List<int> agesFilter = null,
			List<string> citiesFilter = null,
			List<string> educationFilter = null,
			List<string> experienceLevelFilter = null,
			List<int> experienceYearsFilter = null,
			List<string> professionFilter = null,
			List<string> programmingLanguageFilter = null,
			List<string> companySourcesFilter = null,
			bool? isCommunityFilter = null,
			List<string> communitySourcesFilter = null)
		{
			var meta = new MetaModel();
			var data = new Dictionary<string, Dictionary<string, int>>();
			// Фильтруем выборку по фильтрам
			var scores = FilterSource(_scores, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, experienceYearsFilter, professionFilter, programmingLanguageFilter, companySourcesFilter, isCommunityFilter, communitySourcesFilter);

			// Группируем по респондентам
			var interviewees = scores.GroupBy(s => s.IntervieweeId);

			// Теперь надо сделать по каждой группе выборку кого и сколько
			// Города cities
			data.Add("cities", interviewees.Select(i => i.FirstOrDefault()?.City).GroupBy(c => c).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Возраста ages
			data.Add("ages", interviewees.Select(i => i.FirstOrDefault()?.Age).GroupBy(c => c / 5).OrderBy(c => c.Key).ToDictionary(kvp => $"{kvp.Key * 5} - {kvp.Key * 5 + 4}", kvp => kvp.Count()));
			// Образование education
			data.Add("education", interviewees.Select(i => i.FirstOrDefault()?.Education).GroupBy(c => c).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Уровни levels
			data.Add("levels", interviewees.Select(i => i.FirstOrDefault()?.ExperienceLevel).GroupBy(c => c).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Профессии professions
			data.Add("professions", interviewees.Select(i => i.FirstOrDefault()?.Profession).GroupBy(c => c).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Языки программирования languages
			data.Add("languages", interviewees.SelectMany(i => i.FirstOrDefault()?.ProgrammingLanguages).GroupBy(c => c).OrderBy(c => c.Key).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Ходит ли человек на митапы
			data.Add("isCommunity", interviewees.Select(i => i.FirstOrDefault()?.IsCommunity).GroupBy(c => c).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key == true ? "Да" : "Нет", kvp => kvp.Count()));
			// Откуда узнают информацию о компаниях
			data.Add("companySources", interviewees.SelectMany(i => i.FirstOrDefault()?.CompanySources).GroupBy(c => c).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));
			// Откуда узнают информацию о митапах
			data.Add("communitySource", interviewees.SelectMany(i => i.FirstOrDefault()?.CommunitySource).GroupBy(c => c).Where(g => !string.IsNullOrEmpty(g.Key)).OrderByDescending(c => c.Count()).ToDictionary(kvp => kvp.Key, kvp => kvp.Count()));


			meta.count = interviewees.Count();
			meta.Total = _scores.GroupBy(s => s.IntervieweeId).Count();
			meta.sources = data;
			return meta;
		}

		public static List<CompanyModel> GetCompanyModels(
			List<int> agesFilter = null, 
			List<string> citiesFilter = null, 
			List<string> educationFilter = null, 
			List<string> experienceLevelFilter = null, 
			List<int> experienceYearsFilter = null, 
			List<string> professionFilter = null, 
			List<string> programmingLanguageFilter = null, 
			List<string> companySourcesFilter = null, 
			bool? isCommunityFilter = null, 
			List<string> communitySourcesFilter = null)
		{
			var scores = FilterSource(_scores, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, experienceYearsFilter, professionFilter, programmingLanguageFilter, companySourcesFilter, isCommunityFilter, communitySourcesFilter).ToArray();
			var interviewees = scores.GroupBy(s => s.IntervieweeId).Count();

			var errorLevel = 0.0441 + (interviewees < 70 ? (interviewees < 50 ? (interviewees < 18 ? 0.05 : 0.03) : 0.01) : 0);

			var companyNames = _scores.Select(s => s.CompanyName).Distinct();
			var result = new List<CompanyModel>();
			foreach(var company in companyNames)
			{
				var companyScores = scores.Where(s => s.CompanyName == company);

				companyScores = FilterSource(companyScores, agesFilter, citiesFilter, educationFilter, experienceLevelFilter, experienceYearsFilter, professionFilter, programmingLanguageFilter, companySourcesFilter, isCommunityFilter, communitySourcesFilter);

				// Инстанцируем чтобы быстро считать
				var companyScoresArray = companyScores.ToArray();
				result.Add(new CompanyModel
								{
									Name = company,
									KnownLevel = companyScoresArray.Count(cs => cs.IsKnown || cs.IsWanted) / (double) companyScoresArray.Length,
									WantedLevel = companyScoresArray.Count(cs => cs.IsWanted) / (double) companyScoresArray.Length,
									Error = errorLevel
				});
			}

			return result;
		}

		private static IEnumerable<CompanyScore> FilterSource(
			IEnumerable<CompanyScore> source,
			List<int> agesFilter,
			List<string> citiesFilter,
			List<string> educationFilter,
			List<string> experienceLevelFilter,
			List<int> experienceYearsFilter,
			List<string> professionFilter,
			List<string> programmingLanguageFilter,
			List<string> companySourcesFilter,
			bool? isCommunityFilter,
			List<string> communitySourcesFilter)
		{
			if (agesFilter != null && agesFilter.Any())
				source = source.Where(cs => agesFilter.Contains(cs.Age));

			if (citiesFilter != null && citiesFilter.Any())
				source = source.Where(cs => citiesFilter.Contains(cs.City));

			if (educationFilter != null && educationFilter.Any())
				source = source.Where(cs => educationFilter.Contains(cs.Education));

			if (experienceLevelFilter != null && experienceLevelFilter.Any())
				source = source.Where(cs => experienceLevelFilter.Contains(cs.ExperienceLevel));

			if (experienceYearsFilter != null && experienceYearsFilter.Any())
				source = source.Where(cs => experienceYearsFilter.Contains(cs.ExperienceYears));

			if (professionFilter != null && professionFilter.Any())
				source = source.Where(cs => professionFilter.Contains(cs.Profession));

			if (programmingLanguageFilter != null && programmingLanguageFilter.Any())
				source = source.Where(cs => programmingLanguageFilter.Intersect(cs.ProgrammingLanguages).Any());

			if (companySourcesFilter != null && companySourcesFilter.Any())
				source = source.Where(cs => companySourcesFilter.Intersect(cs.CompanySources).Any());

			if (isCommunityFilter.HasValue)
				source = source.Where(cs => cs.IsCommunity == isCommunityFilter.Value);

			if (communitySourcesFilter != null && communitySourcesFilter.Any())
				source = source.Where(cs => communitySourcesFilter.Intersect(cs.CompanySources).Any());

			return source;
		}
	}
}
