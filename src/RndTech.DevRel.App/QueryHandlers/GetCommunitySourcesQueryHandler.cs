using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetCommunitySourcesQueryHandler : IQueryHandler<GetCommunitySourcesQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetCommunitySourcesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetCommunitySourcesQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .CommunitySources
            .OrderBy(cs => cs.Name)
            .Select(cs => cs.Name)
            .ToArrayAsync(cancellationToken);
    }
}