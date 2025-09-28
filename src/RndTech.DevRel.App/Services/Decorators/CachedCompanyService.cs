using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedCompanyService : ICompanyService
{
    private readonly ICompanyService innerService;
    private readonly IDistributedCache cache;

    public CachedCompanyService(ICompanyService innerService, IDistributedCache cache)
    {
        this.innerService = innerService;
        this.cache = cache;
    }

    public async Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(filter);
        return await cache.GetValueOrCreateAsync(cacheKey, () => innerService.GetCompanyModelsAsync(filter, cancellationToken));
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