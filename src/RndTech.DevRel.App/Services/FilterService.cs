using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Services;

public class FilterService : IFilterService
{
    private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

    public FilterService(IDbContextFactory<SurveyDbContext> dbContextFactory)
    {
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default)
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

    public async Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .CommunitySources
            .OrderBy(cs => cs.Name)
            .Select(cs => cs.Name)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.Education)
            .Distinct()
            .OrderBy(e => e)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.ProfessionLevel)
            .Distinct()
            .OrderBy(pl => pl)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default)
    {
        using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db
            .Interviewees
            .Select(i => i.Profession)
            .Distinct()
            .OrderBy(p => p)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default)
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