using Microsoft.AspNetCore.Mvc;
using Enyim.Caching;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Controllers
{
	/// <summary>
	/// Получение данных о доступных фильтрах.
	/// </summary>
	[Route("api/filters")]
	public class FiltersController : ControllerBase
	{
		private const int CacheSeconds = 60 * 60 * 24;
		private readonly IMemcachedClient memcachedClient;

		public FiltersController(IMemcachedClient memcachedClient)
		{
			this.memcachedClient = memcachedClient;
		}
		
		/// <summary>
		/// Получение списка дсотупных городов для фильтрации.
		/// </summary>
		/// <returns>Список названий городов.</returns>
		[HttpGet("cities")]
		public async Task<string[]> GetCities([FromServices] IQueryHandler<GetCitiesQuery, string[]> queryHandler,
			CancellationToken cancellationToken) 
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetCities)), CacheSeconds, 
				async () => await queryHandler.Handle(new GetCitiesQuery(), cancellationToken));

		/// <summary>
		/// Получение списка источников информации о митапах.
		/// Не используется в фильтрах.
		/// </summary>
		/// <returns>Список источников информации о митапах.</returns>
		[HttpGet("communitySources")]
		public async Task<string[]> GetCommunitySources([FromServices] IQueryHandler<GetCommunitySourcesQuery, string[]> queryHandler,
			CancellationToken cancellationToken)
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetCommunitySources)), CacheSeconds, 
				async () => await queryHandler.Handle(new GetCommunitySourcesQuery(), cancellationToken));

		/// <summary>
		/// Получение списка дсотупных уровней образования для фильтрации.
		/// </summary>
		/// <returns>Список уровней образования.</returns>
		[HttpGet("educations")]
		public async Task<string[]> GetEducations([FromServices] IQueryHandler<GetEducationsQuery, string[]> queryHandler,
			CancellationToken cancellationToken)
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetEducations)), CacheSeconds, 
				async () => await queryHandler.Handle(new GetEducationsQuery(), cancellationToken));

		/// <summary>
		/// Получение списка дсотупных грейдов респондентов для фильтрации.
		/// </summary>
		/// <returns>Список названий грейдов.</returns>
		[HttpGet("experienceLevels")]
		public async Task<string[]> GetExperienceLevels([FromServices] IQueryHandler<GetExperienceLevelsQuery, string[]> queryHandler,
			CancellationToken cancellationToken)
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetExperienceLevels)), CacheSeconds, 
				async () => await queryHandler.Handle(new GetExperienceLevelsQuery(), cancellationToken));

		/// <summary>
		/// Получение списка дсотупных профессий для фильтрации.
		/// </summary>
		/// <returns>Список названий профессий.</returns>
		[HttpGet("professions")]
		public async Task<string[]> GetProfessions([FromServices] IQueryHandler<GetProfessionsQuery, string[]> queryHandler,
			CancellationToken cancellationToken)
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetProfessions)), CacheSeconds, 
				async () => await queryHandler.Handle(new GetProfessionsQuery(), cancellationToken));

		/// <summary>
		/// Получение списка дсотупных языков программирования для фильтрации.
		/// </summary>
		/// <returns>Список языков программирования.</returns>
		[HttpGet("programmingLanguages")]
		public async Task<string[]> GetProgrammingLanguages([FromServices] IQueryHandler<GetProgrammingLanguagesQuery, string[]> queryHandler,
			CancellationToken cancellationToken)
			=> await memcachedClient.GetValueOrCreateAsync(GetCacheKey(nameof(GetProgrammingLanguages)), CacheSeconds,
				async () => await queryHandler.Handle(new GetProgrammingLanguagesQuery(), cancellationToken));
		
		private string GetCacheKey(string filterName) => $"{nameof(FiltersController)}_{filterName}";
	}
}
