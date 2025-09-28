using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.App.QueryHandlers;

namespace RndTech.DevRel.App.Controllers;

[ApiController]
[Route("api/results")]
public class ResultsController : ControllerBase
{
    private readonly IQueryHandler<GetCompanyModelsQuery, CompanyModel[]> companyQueryHandler;
    private readonly IQueryHandler<GetMetaQuery, MetaModel> metaQueryHandler;

    public ResultsController(
        IQueryHandler<GetCompanyModelsQuery, CompanyModel[]> companyQueryHandler,
        IQueryHandler<GetMetaQuery, MetaModel> metaQueryHandler)
    {
        this.companyQueryHandler = companyQueryHandler;
        this.metaQueryHandler = metaQueryHandler;
    }

    [HttpPost("known-and-wanted")]
    public async Task<ActionResult<CompanyModel[]>> GetKnownAndWanted(
        [FromBody] UserFilter filter,
        CancellationToken cancellationToken)
    {
        var query = new GetCompanyModelsQuery(filter);
        var result = await companyQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpPost("meta")]
    public async Task<ActionResult<MetaModel>> GetMeta(
        [FromBody] UserFilter filter,
        CancellationToken cancellationToken)
    {
        var query = new GetMetaQuery(filter);
        var result = await metaQueryHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }
}