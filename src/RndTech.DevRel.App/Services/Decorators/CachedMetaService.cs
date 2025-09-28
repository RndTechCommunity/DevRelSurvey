using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedMetaService : IMetaService
{
    private readonly IMetaService innerService;
    private readonly IDistributedCache cache;

    public CachedMetaService(IMetaService innerService, IDistributedCache cache)
    {
        this.innerService = innerService;
        this.cache = cache;
    }

    public async Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(filter);
        return await cache.GetValueOrCreateAsync(cacheKey, () => innerService.GetMetaAsync(filter, cancellationToken));
    }

    private static string GetCacheKey(UserFilter filter)
    {
        var serialized = JsonSerializer.Serialize(filter, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        return $"Meta_{Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(serialized))[..16]}";
    }
}