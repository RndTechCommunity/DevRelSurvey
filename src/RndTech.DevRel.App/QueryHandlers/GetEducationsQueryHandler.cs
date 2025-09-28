using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetEducationsQueryHandler : IQueryHandler<GetEducationsQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetEducationsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetEducationsQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.Education)
            .Distinct()
            .OrderBy(e => e)
            .ToArrayAsync(cancellationToken);
    }
}