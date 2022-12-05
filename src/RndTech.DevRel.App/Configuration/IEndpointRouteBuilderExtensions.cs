using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Configuration;

public static class IEndpointRouteBuilderExtensions
{
	public static void MapResultRoutes(this IEndpointRouteBuilder endpoints)
	{
		endpoints.MapPost("api/results/known-and-wanted",
				async ([FromBody] UserFilter filter,
						[FromServices] IQueryHandler<GetCompanyModelsQuery, CompanyModel[]> queryHandler,
						CancellationToken ct)
					=> await queryHandler.Handle(filter.ToQuery<GetCompanyModelsQuery>(), ct))
			.WithDescription(
				"Получение информации об узнаваемости и привлекательности компаний среди респондентов, соответствующих фильтру.");

		endpoints.MapPost("api/results/meta",
				async ([FromBody] UserFilter filter,
						[FromServices] IQueryHandler<GetMetaQuery, MetaModel> queryHandler,
						CancellationToken ct)
					=> await queryHandler.Handle(filter.ToQuery<GetMetaQuery>(), ct))
			.WithDescription("Получение информации о составе выборки, соответствующей фильтру.");
	}

	public static void MapFilterRoutes(this IEndpointRouteBuilder endpoints)
	{
		var filters = endpoints.MapGroup("api/filters").WithTags("filter");

		filters.MapFilterQuery<GetCitiesQuery, string[]>("/cities")
			.WithDescription("Получение списка дсотупных городов для фильтрации.");

		filters.MapFilterQuery<GetCommunitySourcesQuery, string[]>("/communitySources")
			.WithDescription("Получение списка источников информации о митапах.");

		filters.MapFilterQuery<GetEducationsQuery, string[]>("/educations")
			.WithDescription("Получение списка дсотупных уровней образования для фильтрации.");

		filters.MapFilterQuery<GetExperienceLevelsQuery, string[]>("/experienceLevels")
			.WithDescription("Получение списка дсотупных грейдов респондентов для фильтрации.");

		filters.MapFilterQuery<GetProfessionsQuery, string[]>("/professions")
			.WithDescription("Получение списка дсотупных профессий для фильтрации.");

		filters.MapFilterQuery<GetProgrammingLanguagesQuery, string[]>("/programmingLanguages")
			.WithDescription("Получение списка дсотупных языков программирования для фильтрации.");
	}

	private static RouteHandlerBuilder MapFilterQuery<TQuery, TResult>(this IEndpointRouteBuilder endpoints,
		[StringSyntax("Route")] string pattern)
		where TQuery : new()
		=> endpoints.MapGet(pattern,
			async ([FromServices] IQueryHandler<TQuery, TResult> queryHandler,
					CancellationToken ct)
				=> await queryHandler.Handle(new TQuery(), ct));
}
