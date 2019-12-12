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
							IsKnown = cs[1].Trim().StartsWith("Знаю"),
							IsWanted = cs[1].Trim().Equals("Знаю и хочу работать"),
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
			var companyNames = _scores.Select(s => s.CompanyName).Distinct();
			var result = new List<CompanyModel>();
			foreach(var company in companyNames)
			{
				var companyScores = _scores.Where(s => s.CompanyName == company);

				if (agesFilter != null && agesFilter.Any())
					companyScores = companyScores.Where(cs => agesFilter.Contains(cs.Age));

				if (citiesFilter != null && citiesFilter.Any())
					companyScores = companyScores.Where(cs => citiesFilter.Contains(cs.City));

				if (educationFilter != null && educationFilter.Any())
					companyScores = companyScores.Where(cs => educationFilter.Contains(cs.Education));

				if (experienceLevelFilter != null && experienceLevelFilter.Any())
					companyScores = companyScores.Where(cs => experienceLevelFilter.Contains(cs.ExperienceLevel));

				if (experienceYearsFilter != null && experienceYearsFilter.Any())
					companyScores = companyScores.Where(cs => experienceYearsFilter.Contains(cs.ExperienceYears));

				if (professionFilter != null && professionFilter.Any())
					companyScores = companyScores.Where(cs => professionFilter.Contains(cs.Profession));

				if (programmingLanguageFilter != null && programmingLanguageFilter.Any())
					companyScores = companyScores.Where(cs => programmingLanguageFilter.Intersect(cs.ProgrammingLanguages).Any());

				if (companySourcesFilter != null && companySourcesFilter.Any())
					companyScores = companyScores.Where(cs => companySourcesFilter.Intersect(cs.CompanySources).Any());

				if (isCommunityFilter.HasValue)
					companyScores = companyScores.Where(cs => cs.IsCommunity == isCommunityFilter.Value);

				if (communitySourcesFilter != null && communitySourcesFilter.Any())
					companyScores = companyScores.Where(cs => communitySourcesFilter.Intersect(cs.CompanySources).Any());

				// Инстанцируем чтобы быстро считать
				var companyScoresArray = companyScores.ToArray();
				result.Add(new CompanyModel
								{
									Name = company,
									KnownLevel = companyScoresArray.Count(cs => cs.IsKnown || cs.IsWanted) / (double) companyScoresArray.Length,
									WantedLevel = companyScoresArray.Count(cs => cs.IsWanted) / (double) companyScoresArray.Length
								});
			}

			return result;
		}
	}
}
