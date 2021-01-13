using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Enyim.Caching;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Controllers
{
	/// <summary>
	/// Получение данных о доступных фильтрах.
	/// </summary>
	[Route("api/")]
	public class FiltersController : Controller
	{
		private const int CacheSeconds = 60 * 60 * 24;
		private readonly SurveyDbContext dbContext;
		private readonly IMemcachedClient memcachedClient;

		public FiltersController(SurveyDbContext dbContext, IMemcachedClient memcachedClient)
		{
			this.dbContext = dbContext;
			this.memcachedClient = memcachedClient;
		}
		
		/// <summary>
		/// Получение списка дсотупных городов для фильтрации.
		/// </summary>
		/// <returns>Список названий городов.</returns>
		[HttpGet]
		[Route("cities")]
		public async Task<List<string>> GetCities() 
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetCities)), CacheSeconds, async () =>
				await dbContext
					.Interviewees
					.GroupBy(i => i.City)
					.Where(g => g.Count() > 2)
					.OrderByDescending(g => g.Count())
					.Select(g => g.Key)
					.ToListAsync());

		/// <summary>
		/// Получение списка источников информации о митапах.
		/// Не используется в фильтрах.
		/// </summary>
		/// <returns>Список источников информации о митапах.</returns>
		[HttpGet]
		[Route("communitySources")]
		public async Task<List<string>> GetCommunitySources()
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetCommunitySources)), CacheSeconds, async () =>
				await dbContext
					.CommunitySources
					.Select(cs => cs.Name)
					.ToListAsync());

		/// <summary>
		/// Получение списка дсотупных уровней образования для фильтрации.
		/// </summary>
		/// <returns>Список уровней образования.</returns>
		[HttpGet]
		[Route("educations")]
		public async Task<List<string>> GetEducations()
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetEducations)), CacheSeconds, async () =>
				await dbContext
					.Interviewees
					.GroupBy(i => i.Education)
					.OrderByDescending(g => g.Count())
					.Select(g => g.Key)
					.ToListAsync());

		/// <summary>
		/// Получение списка дсотупных грейдов респондентов для фильтрации.
		/// </summary>
		/// <returns>Список названий грейдов.</returns>
		[HttpGet]
		[Route("experienceLevels")]
		public async Task<List<string>> GetExperienceLevels()
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetExperienceLevels)), CacheSeconds, async () =>
				await dbContext
					.Interviewees
					.GroupBy(i => i.ProfessionLevel)
					.Select(g => g.Key)
					.ToListAsync());

		/// <summary>
		/// Получение списка дсотупных профессий для фильтрации.
		/// </summary>
		/// <returns>Список названий профессий.</returns>
		[HttpGet]
		[Route("professions")]
		public async Task<List<string>> GetProfessions()
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetProfessions)), CacheSeconds, async () =>
				await dbContext
					.Interviewees
					.GroupBy(i => i.Profession)
					.OrderByDescending(g => g.Count())
					.Select(g => g.Key)
					.ToListAsync());

		/// <summary>
		/// Получение списка дсотупных языков программирования для фильтрации.
		/// </summary>
		/// <returns>Список языков программирования.</returns>
		[HttpGet]
		[Route("programmingLanguages")]
		public async Task<List<string>> GetProgrammingLanguages()
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetProgrammingLanguages)), CacheSeconds,
				async () =>
					await dbContext
						.Languages
						.Select(l => l.Name)
						.Where(l => l != "JavaScript / TypeScript")
						.OrderBy(l => l)
						.ToListAsync());
		
		private string GetCacheKey(string filterName) => $"{nameof(FiltersController)}_{filterName}";
	}
}
