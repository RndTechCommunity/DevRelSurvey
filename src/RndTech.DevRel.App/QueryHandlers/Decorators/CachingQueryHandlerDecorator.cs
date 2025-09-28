using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.App.Services;

namespace RndTech.DevRel.App.QueryHandlers.Decorators;

public class CachingQueryHandlerDecorator<TQuery, TResult> : IQueryHandler<TQuery, TResult>
    where TQuery : class, IQuery<TResult>
{
    private readonly IQueryHandler<TQuery, TResult> innerHandler;
    private readonly ICacheService cacheService;
    private readonly TimeSpan cacheExpiration;
    private readonly ILogger<CachingQueryHandlerDecorator<TQuery, TResult>> logger;

    public CachingQueryHandlerDecorator(
        IQueryHandler<TQuery, TResult> innerHandler,
        ICacheService cacheService,
        IOptions<CacheOptions> cacheOptions,
        ILogger<CachingQueryHandlerDecorator<TQuery, TResult>> logger)
    {
        this.innerHandler = innerHandler;
        this.cacheService = cacheService;
        this.cacheExpiration = cacheOptions.Value.CacheTimeSpan;
        this.logger = logger;
    }

    public async Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken = default)
    {
        var cacheKey = QueryCacheKeyGenerator.Generate(query);

        // Попытка получить из кэша
        var cachedResult = await cacheService.GetAsync<TResult>(cacheKey, cancellationToken);
        if (cachedResult != null)
        {
            logger.LogDebug("Cache hit for query {QueryType} with key {CacheKey}",
                typeof(TQuery).Name, cacheKey);
            return cachedResult;
        }

        logger.LogDebug("Cache miss for query {QueryType} with key {CacheKey}",
            typeof(TQuery).Name, cacheKey);

        // Выполнить запрос
        var result = await innerHandler.HandleAsync(query, cancellationToken);

        // Сохранить в кэш
        await cacheService.SetAsync(cacheKey, result, cacheExpiration, cancellationToken);

        return result;
    }
}