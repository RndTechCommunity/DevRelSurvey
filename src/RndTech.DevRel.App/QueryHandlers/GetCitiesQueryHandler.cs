using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetCitiesQueryHandler : IQueryHandler<GetCitiesQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetCitiesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetCitiesQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .GroupBy(i => i.City)
            .Where(g => g.Count() > 2)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .ToArrayAsync(cancellationToken);
    }
}