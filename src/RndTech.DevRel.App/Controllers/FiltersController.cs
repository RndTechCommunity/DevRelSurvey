using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Services;

namespace RndTech.DevRel.App.Controllers;

[ApiController]
[Route("api/filters")]
[Tags("filter")]
public class FiltersController : ControllerBase
{
    private readonly IFilterService filterService;

    public FiltersController(IFilterService filterService)
    {
        this.filterService = filterService;
    }

    [HttpGet("cities")]
    public async Task<ActionResult<string[]>> GetCities(CancellationToken cancellationToken)
    {
        var result = await filterService.GetCitiesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("communitySources")]
    public async Task<ActionResult<string[]>> GetCommunitySources(CancellationToken cancellationToken)
    {
        var result = await filterService.GetCommunitySourcesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("educations")]
    public async Task<ActionResult<string[]>> GetEducations(CancellationToken cancellationToken)
    {
        var result = await filterService.GetEducationsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("experienceLevels")]
    public async Task<ActionResult<string[]>> GetExperienceLevels(CancellationToken cancellationToken)
    {
        var result = await filterService.GetExperienceLevelsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("professions")]
    public async Task<ActionResult<string[]>> GetProfessions(CancellationToken cancellationToken)
    {
        var result = await filterService.GetProfessionsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("programmingLanguages")]
    public async Task<ActionResult<string[]>> GetProgrammingLanguages(CancellationToken cancellationToken)
    {
        var result = await filterService.GetProgrammingLanguagesAsync(cancellationToken);
        return Ok(result);
    }
}