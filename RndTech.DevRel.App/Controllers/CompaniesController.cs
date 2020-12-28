using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Enyim.Caching;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Controllers
{
	[Route("api/")]
	public class CompanyController : Controller
	{
		private const int CacheSeconds = 60 * 60 * 24;
		private readonly SurveyDbContext dbContext;
		private readonly IMemcachedClient cache;

		public CompanyController(SurveyDbContext dbContext, IMemcachedClient cache)
		{
			this.dbContext = dbContext;
			this.cache = cache;
		}

		[Route("known-and-wanted")]
		[HttpPost]
		public async Task<Dictionary<string, CompanyModel>> GetCompanies([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("companies", filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);
				UpdateLanguagesFilter(filter);
				
				var result = await SurveyService.GetCompanyModels(
					dbContext,
					filter.Year,
					ageFilter,
					filter.cities,
					filter.educations,
					filter.experiences,
					filter.professions,
					filter.languages,
					communityFilter);
				
				return result.ToDictionary(cm => cm.Name, cm => cm);
			});
		}

		[Route("meta")]
		[HttpPost]
		public async Task<MetaModel> GetMeta([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("meta", filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);
				UpdateLanguagesFilter(filter);
				
				return await SurveyService.GetMeta(
					dbContext,
					filter.Year,
					ageFilter,
					filter.cities,
					filter.educations,
					filter.experiences,
					filter.professions,
					filter.languages,
					communityFilter);
			});
		}

		private void UpdateLanguagesFilter(UserFilter filter)
		{
			if (filter.Year == 2019 && filter.languages != null && filter.languages.Any())
				if (filter.languages.Contains("TypeScript") || filter.languages.Contains("JavaScript"))
					filter.languages = filter.languages.Concat(new[] {"JavaScript / TypeScript"}).ToArray();
		}

		private static bool? GetCommunityFilter(UserFilter filter) =>
			filter.isCommunity switch
			{
				"Да" => true,
				"Нет" => false,
				_ => null
			};

		private static int[] GetAgeFilter(UserFilter filter) =>
			filter.ages
				.Select(age => int.Parse(age.Substring(0, 2)))
				.SelectMany(af => Enumerable.Range(af, 5))
				.ToArray();

		private static string GetCacheKey(string methodName, UserFilter filter) =>
			$"{methodName}_{filter.Year}_{string.Join(',', filter.cities)}_{string.Join(',', filter.educations)}_{string.Join(',', filter.languages)}_{string.Join(',', filter.professions)}_{string.Join(',', filter.experiences)}_{string.Join(',', filter.ages)}_{string.Join(',', filter.isCommunity)}"
				.Replace(" ", "");
	}
}
