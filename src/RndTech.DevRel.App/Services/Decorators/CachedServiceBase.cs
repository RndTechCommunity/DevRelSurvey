using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

/// <summary>
/// Базовый класс для кэширующих сервисов.
/// </summary>
public abstract class CachedServiceBase
{
    protected readonly ICacheService CacheService;
    protected readonly IOptions<CacheOptions> CacheOptions;
    protected readonly ILogger Logger;

    protected CachedServiceBase(
        ICacheService cacheService,
        IOptions<CacheOptions> cacheOptions,
        ILogger logger)
    {
        CacheService = cacheService;
        CacheOptions = cacheOptions;
        Logger = logger;
    }

    /// <summary>
    /// Выполняет кэширование результата операции.
    /// </summary>
    protected async Task<T> ExecuteWithCacheAsync<T>(
        string cacheKey,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        var cachedResult = await CacheService.GetAsync<T>(cacheKey, cancellationToken);
        if (cachedResult != null)
        {
            Logger.LogDebug("Cache hit for key: {CacheKey}", cacheKey);
            return cachedResult;
        }

        Logger.LogDebug("Cache miss for key: {CacheKey}", cacheKey);
        var result = await factory();

        await CacheService.SetAsync(
            cacheKey,
            result,
            TimeSpan.FromSeconds(CacheOptions.Value.ExpirationSeconds),
            cancellationToken);

        return result;
    }

    /// <summary>
    /// Генерирует ключ кэша для фильтра пользователя.
    /// </summary>
    protected static string GenerateUserFilterCacheKey(string prefix, UserFilter filter)
    {
        var keyParts = new List<string>
        {
            prefix,
            string.Join(",", filter.Cities ?? Array.Empty<string>()),
            string.Join(",", filter.Ages ?? Array.Empty<string>()),
            string.Join(",", filter.Educations ?? Array.Empty<string>()),
            string.Join(",", filter.Experiences ?? Array.Empty<string>()),
            string.Join(",", filter.Professions ?? Array.Empty<string>()),
            string.Join(",", filter.Languages ?? Array.Empty<string>()),
            filter.IsCommunity?.ToString() ?? "null"
        };

        return string.Join("|", keyParts);
    }
}