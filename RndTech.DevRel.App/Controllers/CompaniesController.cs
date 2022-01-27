using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System.Linq;
using System.Threading.Tasks;
using Enyim.Caching;

namespace RndTech.DevRel.App.Controllers
{
	/// <summary>
	/// Получение данных о выборке.
	/// </summary>
	[Route("api/")]
	public class CompanyController : Controller
	{
		private const int CacheSeconds = 60 * 60 * 24;
		private readonly SurveyService surveyService;
		private readonly IMemcachedClient cache;

		public CompanyController(SurveyService surveyService, IMemcachedClient cache)
		{
			this.surveyService = surveyService;
			this.cache = cache;
		}

		/// <summary>
		/// Получения информации об узнаваемости и привлекательности компаний среди респондентов, соответствующих фильтру.
		/// </summary>
		/// <param name="filter">Фильтр для данных о компаниях.</param>
		/// <returns>Данные о узнаваемости и привлекательности компаний.</returns>
		[Route("known-and-wanted")]
		[HttpPost]
		public async Task<CompanyModel[]> GetCompanies([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("companies2", filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);
				UpdateLanguagesFilter(filter);

				var result = await surveyService.GetCompanyModels(
					ageFilter,
					filter.cities,
					filter.educations,
					filter.experiences,
					filter.professions,
					filter.languages,
					communityFilter);
				return result.ToArray();
			});
		}

		/// <summary>
		/// Получения информации о составе выборки, соответствующей фильтру.
		/// </summary>
		/// <param name="filter">Фильтр для данных о выборки.</param>
		/// <returns>Данные о составе выборки, оответствующей фильтрм.</returns>
		[Route("meta")]
		[HttpPost]
		public async Task<MetaModel> GetMeta([FromBody] UserFilter filter)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("meta", filter), CacheSeconds, async () =>
			{
				var ageFilter = GetAgeFilter(filter);
				var communityFilter = GetCommunityFilter(filter);
				UpdateLanguagesFilter(filter);
				
				return await surveyService.GetMeta(
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
			if (filter.languages != null && filter.languages.Any())
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
