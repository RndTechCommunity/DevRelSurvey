using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedFilterService : CachedServiceBase, IFilterService
{
    private readonly IFilterService innerService;

    public CachedFilterService(
        IFilterService innerService,
        ICacheService cacheService,
        IOptions<CacheOptions> cacheOptions,
        ILogger<CachedFilterService> logger)
        : base(cacheService, cacheOptions, logger)
    {
        this.innerService = innerService;
    }

    public async Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "cities",
            () => innerService.GetCitiesAsync(cancellationToken),
            cancellationToken);
    }

    public async Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "community_sources",
            () => innerService.GetCommunitySourcesAsync(cancellationToken),
            cancellationToken);
    }

    public async Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "educations",
            () => innerService.GetEducationsAsync(cancellationToken),
            cancellationToken);
    }

    public async Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "experience_levels",
            () => innerService.GetExperienceLevelsAsync(cancellationToken),
            cancellationToken);
    }

    public async Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "professions",
            () => innerService.GetProfessionsAsync(cancellationToken),
            cancellationToken);
    }

    public async Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithCacheAsync(
            "programming_languages",
            () => innerService.GetProgrammingLanguagesAsync(cancellationToken),
            cancellationToken);
    }
}