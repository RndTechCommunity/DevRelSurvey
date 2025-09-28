using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedMetaService : CachedServiceBase, IMetaService
{
    private readonly IMetaService innerService;

    public CachedMetaService(
        IMetaService innerService,
        ICacheService cacheService,
        IOptions<CacheOptions> cacheOptions,
        ILogger<CachedMetaService> logger)
        : base(cacheService, cacheOptions, logger)
    {
        this.innerService = innerService;
    }

    public async Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var cacheKey = GenerateUserFilterCacheKey("meta", filter);
        return await ExecuteWithCacheAsync(
            cacheKey,
            () => innerService.GetMetaAsync(filter, cancellationToken),
            cancellationToken);
    }
}