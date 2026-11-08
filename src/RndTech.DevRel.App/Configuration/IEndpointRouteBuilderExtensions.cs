using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using Microsoft.AspNetCore.Http.Features;
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

		endpoints.MapPost("api/results/audience-matrix", HandleAudienceMatrix)
			.WithDescription("Матрица компаний: общий фильтр AND значение каждой колонки за один год.");

		endpoints.MapPost("api/results/meta",
				async ([FromBody] UserFilter filter,
						[FromServices] IQueryHandler<GetMetaQuery, MetaModel> queryHandler,
						CancellationToken ct)
					=> await queryHandler.Handle(filter.ToQuery<GetMetaQuery>(), ct))
			.WithDescription("Получение информации о составе выборки, соответствующей фильтру.");
	}

	private static async Task<IResult> HandleAudienceMatrix(HttpContext context,
		IQueryHandler<AudienceMatrixRequest, AudienceMatrixResponse> queryHandler, CancellationToken ct)
	{
		var request = context.Request;
		if (request.ContentLength > AudienceMatrixRequest.MaxBodyBytes)
			return Results.Problem(statusCode: StatusCodes.Status413PayloadTooLarge);
		var bodyLimit = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
		if (bodyLimit is { IsReadOnly: false })
			bodyLimit.MaxRequestBodySize = AudienceMatrixRequest.MaxBodyBytes;
		if (!request.HasJsonContentType())
			return Results.Problem(statusCode: StatusCodes.Status415UnsupportedMediaType);
		try
		{
			var matrix = await request.ReadFromJsonAsync<AudienceMatrixRequest>(ct);
			if (matrix is null)
				return Results.ValidationProblem(new Dictionary<string, string[]> { ["body"] = ["Ожидается JSON-объект."] });
			var errors = GetAudienceMatrixQueryHandler.Validate(matrix);
			return errors.Count == 0 ? Results.Ok(await queryHandler.Handle(matrix, ct)) : Results.ValidationProblem(errors);
		}
		catch (JsonException)
		{
			return Results.ValidationProblem(new Dictionary<string, string[]> { ["body"] = ["Неверный JSON или тип поля."] });
		}
		catch (BadHttpRequestException error) when (error.StatusCode is 400 or 413)
		{
			return Results.Problem(statusCode: error.StatusCode);
		}
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
