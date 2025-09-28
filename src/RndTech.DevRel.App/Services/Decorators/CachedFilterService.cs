using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedFilterService : IFilterService
{
    private readonly IFilterService innerService;
    private readonly IDistributedCache cache;
    private readonly CacheOptions cacheOptions;

    public CachedFilterService(IFilterService innerService, IDistributedCache cache, IOptions<CacheOptions> cacheOptions)
    {
        this.innerService = innerService;
        this.cache = cache;
        this.cacheOptions = cacheOptions.Value;
    }

    public async Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterCities",
            () => innerService.GetCitiesAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    public async Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterCommunitySources",
            () => innerService.GetCommunitySourcesAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    public async Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterEducations",
            () => innerService.GetEducationsAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    public async Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterExperienceLevels",
            () => innerService.GetExperienceLevelsAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    public async Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterProfessions",
            () => innerService.GetProfessionsAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    public async Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await cache.GetValueOrCreateAsync("FilterProgrammingLanguages",
            () => innerService.GetProgrammingLanguagesAsync(cancellationToken),
            cacheOptions.CacheTimeSpan);
    }
}