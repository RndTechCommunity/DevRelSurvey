using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetExperienceLevelsQueryHandler : IQueryHandler<GetExperienceLevelsQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetExperienceLevelsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetExperienceLevelsQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.ProfessionLevel)
            .Distinct()
            .OrderBy(pl => pl)
            .ToArrayAsync(cancellationToken);
    }
}