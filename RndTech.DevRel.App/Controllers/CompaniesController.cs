using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Enyim.Caching;
using Newtonsoft.Json;

namespace RndTech.DevRel.App.Controllers
{
	[Route("api/")]
	public class CompanyController : Controller
	{
		private readonly IMemcachedClient cache;

		public CompanyController(IMemcachedClient cache)
		{
			this.cache = cache;
		}
		
		[Route("all-companies")]
		public List<CompanyModel> All()
		{
			return InMemoryDbContext.GetCompanyModels();
		}

		[Route("known-and-wanted")]
		public async Task<Dictionary<string, CompanyModel>> GetCompanies(string cities, string educations, string languages, string professions, string experiences, string ages, string isCommunity)
		{
			var key = $"COMPANIES_{cities}_{educations}_{languages}_{professions}_{experiences}_{ages}_{isCommunity}".Replace(" ", "");
			var cachedResult = await cache.GetAsync<Dictionary<string, CompanyModel>>(key);
			if (cachedResult.Success)
				return cachedResult.Value;

			var citiesFilter = JsonConvert.DeserializeObject<string[]>(cities);
			var educationFilter = JsonConvert.DeserializeObject<string[]>(educations);
			var languagesFilter = JsonConvert.DeserializeObject<string[]>(languages);
			var professionFilter = JsonConvert.DeserializeObject<string[]>(professions);
			var experienceLevelFilter = JsonConvert.DeserializeObject<string[]>(experiences);
			var ageFilter = JsonConvert.DeserializeObject<string[]>(ages)
				.Select(age => int.Parse(age.Substring(0, 2)))
				.SelectMany(af => Enumerable.Range(af, 5))
				.ToArray();
			isCommunity = isCommunity.Trim('"');
			bool? communityFilter = isCommunity == "Да" ? true : (isCommunity == "Нет" ? (bool?)false : null);

			var r = InMemoryDbContext.GetCompanyModels(
				citiesFilter: citiesFilter, 
				educationFilter: educationFilter, 
				programmingLanguageFilter: languagesFilter, 
				professionFilter: professionFilter,
				experienceLevelFilter: experienceLevelFilter,
				agesFilter: ageFilter,
				isCommunityFilter: communityFilter).ToDictionary(cm => cm.Name, cm => cm);
			await cache.AddAsync(key, r, 60 * 60 * 24);
			return r;
		}

		[Route("meta")]
		public async Task<MetaModel> GetMeta(string cities, string educations, string languages, string professions, string experiences, string ages, string isCommunity)
		{
			var key = $"META_{cities}_{educations}_{languages}_{professions}_{experiences}_{ages}_{isCommunity}".Replace(" ", "");
			var cachedResult = await cache.GetAsync<MetaModel>(key);
			if (cachedResult.Success)
				return cachedResult.Value;

			var citiesFilter = JsonConvert.DeserializeObject<string[]>(cities);
			var educationFilter = JsonConvert.DeserializeObject<string[]>(educations);
			var languagesFilter = JsonConvert.DeserializeObject<string[]>(languages);
			var professionFilter = JsonConvert.DeserializeObject<string[]>(professions);
			var experienceLevelFilter = JsonConvert.DeserializeObject<string[]>(experiences);
			var ageFilter = JsonConvert.DeserializeObject<string[]>(ages)
				.Select(age => int.Parse(age.Substring(0, 2)))
				.SelectMany(af => Enumerable.Range(af, 5))
				.ToArray();
			isCommunity = isCommunity.Trim('"');
			bool? communityFilter = isCommunity == "Да" ? true : (isCommunity == "Нет" ? (bool?) false : null);

			var r = InMemoryDbContext.GetMeta(
				citiesFilter: citiesFilter,
				educationFilter: educationFilter,
				programmingLanguageFilter: languagesFilter,
				professionFilter: professionFilter,
				experienceLevelFilter: experienceLevelFilter,
				agesFilter: ageFilter,
				isCommunityFilter: communityFilter);
			await cache.AddAsync(key, r, 60 * 60 * 24);
			return r;
		}
	}
}
