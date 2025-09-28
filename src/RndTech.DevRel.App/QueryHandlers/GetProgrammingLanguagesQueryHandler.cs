using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetProgrammingLanguagesQueryHandler : IQueryHandler<GetProgrammingLanguagesQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetProgrammingLanguagesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetProgrammingLanguagesQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var languages = await db
            .Languages
            .OrderBy(l => l.Name)
            .Select(l => l.Name)
            .ToArrayAsync(cancellationToken);

        // Handle special case for JavaScript / TypeScript
        return languages
            .Where(l => l != "JavaScript / TypeScript")
            .Concat(new[] { "JavaScript", "TypeScript" })
            .Distinct()
            .OrderBy(l => l)
            .ToArray();
    }
}