using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Implementation;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedFilterService : IFilterService
{
    private readonly IFilterService innerService;
    private readonly IDistributedCache cache;

    public CachedFilterService(IFilterService innerService, IDistributedCache cache)
    {
        this.innerService = innerService;
        this.cache = cache;
    }

    public async Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterCities", () => innerService.GetCitiesAsync(cancellationToken));
    }

    public async Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterCommunitySources", () => innerService.GetCommunitySourcesAsync(cancellationToken));
    }

    public async Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterEducations", () => innerService.GetEducationsAsync(cancellationToken));
    }

    public async Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterExperienceLevels", () => innerService.GetExperienceLevelsAsync(cancellationToken));
    }

    public async Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterProfessions", () => innerService.GetProfessionsAsync(cancellationToken));
    }

    public async Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterProgrammingLanguages", () => innerService.GetProgrammingLanguagesAsync(cancellationToken));
    }
}