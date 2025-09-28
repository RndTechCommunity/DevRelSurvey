using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Services;

namespace RndTech.DevRel.App.Controllers;

[ApiController]
[Route("api/results")]
public class ResultsController : ControllerBase
{
    private readonly ICompanyService companyService;
    private readonly IMetaService metaService;

    public ResultsController(ICompanyService companyService, IMetaService metaService)
    {
        this.companyService = companyService;
        this.metaService = metaService;
    }

    [HttpPost("known-and-wanted")]
    public async Task<ActionResult<CompanyModel[]>> GetKnownAndWanted(
        [FromBody] UserFilter filter,
        CancellationToken cancellationToken)
    {
        var result = await companyService.GetCompanyModelsAsync(filter, cancellationToken);
        return Ok(result);
    }

    [HttpPost("meta")]
    public async Task<ActionResult<MetaModel>> GetMeta(
        [FromBody] UserFilter filter,
        CancellationToken cancellationToken)
    {
        var result = await metaService.GetMetaAsync(filter, cancellationToken);
        return Ok(result);
    }
}