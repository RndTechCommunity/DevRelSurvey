using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services.Decorators;

public class CachedCompanyService : CachedServiceBase, ICompanyService
{
    private readonly ICompanyService innerService;

    public CachedCompanyService(
        ICompanyService innerService,
        ICacheService cacheService,
        IOptions<CacheOptions> cacheOptions,
        ILogger<CachedCompanyService> logger)
        : base(cacheService, cacheOptions, logger)
    {
        this.innerService = innerService;
    }

    public async Task<CompanyModel[]> GetCompaniesAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        var cacheKey = GenerateUserFilterCacheKey("companies", filter);
        return await ExecuteWithCacheAsync(
            cacheKey,
            () => innerService.GetCompaniesAsync(filter, cancellationToken),
            cancellationToken);
    }
}