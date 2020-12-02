using System;
using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Enyim.Caching;
using Newtonsoft.Json;
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
		
		[Route("all-companies")]
		public List<CompanyModel> All()
		{
			return InMemoryDbContext.GetCompanyModels();
		}

		[Route("known-and-wanted")]
		[HttpPost]
		public async Task<Dictionary<string, CompanyModel>> GetCompanies([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey(filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);

				return InMemoryDbContext.GetCompanyModels(
						citiesFilter: filter.cities,
						educationFilter: filter.educations,
						programmingLanguageFilter: filter.languages,
						professionFilter: filter.professions,
						experienceLevelFilter: filter.experiences,
			var xxx = SurveyService.GetCompanyModels(
				dbContext,
				agesFilter: ageFilter,
				citiesFilter: citiesFilter,
				educationFilter: educationFilter,
				professionFilter: professionFilter,
				programmingLanguageFilter: languagesFilter,
				isCommunityFilter: communityFilter);
			return xxx.ToDictionary(cm => cm.Name, cm => cm);
						agesFilter: ageFilter,
						isCommunityFilter: communityFilter)
					.ToDictionary(cm => cm.Name, cm => cm);
			});
		}

		[Route("meta")]
		[HttpPost]
		public async Task<MetaModel> GetMeta([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey(filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);

				return InMemoryDbContext.GetMeta(
					citiesFilter: filter.cities,
					educationFilter: filter.educations,
					programmingLanguageFilter: filter.languages,
					professionFilter: filter.professions,
					experienceLevelFilter: filter.experiences,
					agesFilter: ageFilter,
					isCommunityFilter: communityFilter);
			});
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

		private static string GetCacheKey(UserFilter filter) =>
			$"META_{string.Join(',', filter.cities)}_{string.Join(',', filter.educations)}_{string.Join(',', filter.languages)}_{string.Join(',', filter.professions)}_{string.Join(',', filter.experiences)}_{string.Join(',', filter.ages)}_{string.Join(',', filter.isCommunity)}"
				.Replace(" ", "");
	}
}
