using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.QueryHandlers;

public class GetProfessionsQueryHandler : IQueryHandler<GetProfessionsQuery, string[]>
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public GetProfessionsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> HandleAsync(GetProfessionsQuery query, CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.Profession)
            .Distinct()
            .OrderBy(p => p)
            .ToArrayAsync(cancellationToken);
    }
}