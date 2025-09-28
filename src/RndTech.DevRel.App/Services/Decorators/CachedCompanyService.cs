using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedCompanyService : ICompanyService
{
    private readonly ICompanyService innerService;
    private readonly IDistributedCache cache;
    private readonly CacheOptions cacheOptions;

    public CachedCompanyService(ICompanyService innerService, IDistributedCache cache, IOptions<CacheOptions> cacheOptions)
    {
        this.innerService = innerService;
        this.cache = cache;
        this.cacheOptions = cacheOptions.Value;
    }

    public async Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(filter);
        return await cache.GetValueOrCreateAsync(cacheKey,
            () => innerService.GetCompanyModelsAsync(filter, cancellationToken),
            cacheOptions.CacheTimeSpan);
    }

    private static string GetCacheKey(UserFilter filter)
    {
        var serialized = JsonSerializer.Serialize(filter, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        return $"CompanyModels_{Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(serialized))[..16]}";
    }
}