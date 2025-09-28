using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace RndTech.DevRel.App.Services;

public class CacheService : ICacheService
{
    private readonly IDistributedCache distributedCache;
    private readonly ILogger<CacheService> logger;

    public CacheService(IDistributedCache distributedCache, ILogger<CacheService> logger)
    {
        this.distributedCache = distributedCache;
        this.logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var cached = await distributedCache.GetStringAsync(key, cancellationToken);
            if (cached == null) return default;

            return JsonSerializer.Deserialize<T>(cached);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to get cached value for key: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default)
    {
        try
        {
            var serialized = JsonSerializer.Serialize(value);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            await distributedCache.SetStringAsync(key, serialized, options, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to set cached value for key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await distributedCache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to remove cached value for key: {Key}", key);
        }
    }
}