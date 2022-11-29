using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using Enyim.Caching;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Controllers
{
	/// <summary>
	/// Получение данных о выборке.
	/// </summary>
	[Route("api/results")]
	public class CompanyController : ControllerBase
	{
		private const int CacheSeconds = 60 * 60 * 24;
		private readonly IMemcachedClient cache;

		public CompanyController(IMemcachedClient cache)
		{
			this.cache = cache;
		}

		/// <summary>
		/// Получения информации об узнаваемости и привлекательности компаний среди респондентов, соответствующих фильтру.
		/// </summary>
		/// <param name="filter">Фильтр для данных о компаниях.</param>
		/// <param name="queryHandler">Обработчик запроса.</param>
		/// <param name="cancellationToken">CancellationToken.</param>
		/// <returns>Данные о узнаваемости и привлекательности компаний.</returns>
		[HttpPost("known-and-wanted")]
		public async Task<CompanyModel[]> GetCompanies([FromBody] UserFilter filter, 
			[FromServices] IQueryHandler<GetCompanyModelsQuery, CompanyModel[]> queryHandler,
			CancellationToken cancellationToken)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("companies2", filter), CacheSeconds, async () 
				=> await queryHandler.Handle(filter.ToQuery<GetCompanyModelsQuery>(), cancellationToken));
		}

		/// <summary>
		/// Получения информации о составе выборки, соответствующей фильтру.
		/// </summary>
		/// <param name="filter">Фильтр для данных о выборки.</param>
		/// <param name="queryHandler">Обработчик запроса.</param>
		/// <param name="cancellationToken">CancellationToken.</param>
		/// <returns>Данные о составе выборки, оответствующей фильтрм.</returns>
		[HttpPost("meta")]
		public async Task<MetaModel> GetMeta([FromBody] UserFilter filter,
			[FromServices] IQueryHandler<GetMetaQuery, MetaModel> queryHandler,
			CancellationToken cancellationToken)
		{
			return await cache.GetValueOrCreateAsync(GetCacheKey("meta", filter), CacheSeconds, async () 
				=> await queryHandler.Handle(filter.ToQuery<GetMetaQuery>(), cancellationToken));
		}

		private static string GetCacheKey(string methodName, UserFilter filter) =>
			$"{methodName}_{filter.Year}_{string.Join(',', filter.Cities)}_{string.Join(',', filter.Educations)}_{string.Join(',', filter.Languages)}_{string.Join(',', filter.Professions)}_{string.Join(',', filter.Experiences)}_{string.Join(',', filter.Ages)}_{string.Join(',', filter.IsCommunity)}"
				.Replace(" ", "");
	}
}
