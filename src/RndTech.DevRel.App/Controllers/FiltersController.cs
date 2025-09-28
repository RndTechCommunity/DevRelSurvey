using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.App.QueryHandlers;

namespace RndTech.DevRel.App.Controllers;

[ApiController]
[Route("api/filters")]
[Tags("filter")]
public class FiltersController : ControllerBase
{
    private readonly IQueryHandler<GetCitiesQuery, string[]> citiesQueryHandler;
    private readonly IQueryHandler<GetCommunitySourcesQuery, string[]> communitySourcesQueryHandler;
    private readonly IQueryHandler<GetEducationsQuery, string[]> educationsQueryHandler;
    private readonly IQueryHandler<GetExperienceLevelsQuery, string[]> experienceLevelsQueryHandler;
    private readonly IQueryHandler<GetProfessionsQuery, string[]> professionsQueryHandler;
    private readonly IQueryHandler<GetProgrammingLanguagesQuery, string[]> programmingLanguagesQueryHandler;

    public FiltersController(
        IQueryHandler<GetCitiesQuery, string[]> citiesQueryHandler,
        IQueryHandler<GetCommunitySourcesQuery, string[]> communitySourcesQueryHandler,
        IQueryHandler<GetEducationsQuery, string[]> educationsQueryHandler,
        IQueryHandler<GetExperienceLevelsQuery, string[]> experienceLevelsQueryHandler,
        IQueryHandler<GetProfessionsQuery, string[]> professionsQueryHandler,
        IQueryHandler<GetProgrammingLanguagesQuery, string[]> programmingLanguagesQueryHandler)
    {
        this.citiesQueryHandler = citiesQueryHandler;
        this.communitySourcesQueryHandler = communitySourcesQueryHandler;
        this.educationsQueryHandler = educationsQueryHandler;
        this.experienceLevelsQueryHandler = experienceLevelsQueryHandler;
        this.professionsQueryHandler = professionsQueryHandler;
        this.programmingLanguagesQueryHandler = programmingLanguagesQueryHandler;
    }

    [HttpGet("cities")]
    public async Task<ActionResult<string[]>> GetCities(CancellationToken cancellationToken)
    {
        var query = new GetCitiesQuery();
        var result = await citiesQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("communitySources")]
    public async Task<ActionResult<string[]>> GetCommunitySources(CancellationToken cancellationToken)
    {
        var query = new GetCommunitySourcesQuery();
        var result = await communitySourcesQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("educations")]
    public async Task<ActionResult<string[]>> GetEducations(CancellationToken cancellationToken)
    {
        var query = new GetEducationsQuery();
        var result = await educationsQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("experienceLevels")]
    public async Task<ActionResult<string[]>> GetExperienceLevels(CancellationToken cancellationToken)
    {
        var query = new GetExperienceLevelsQuery();
        var result = await experienceLevelsQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("professions")]
    public async Task<ActionResult<string[]>> GetProfessions(CancellationToken cancellationToken)
    {
        var query = new GetProfessionsQuery();
        var result = await professionsQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("programmingLanguages")]
    public async Task<ActionResult<string[]>> GetProgrammingLanguages(CancellationToken cancellationToken)
    {
        var query = new GetProgrammingLanguagesQuery();
        var result = await programmingLanguagesQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }
}