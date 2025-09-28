using RndTech.DevRel.App.Configuration;

namespace RndTech.DevRel.App.Extensions;

public static class CacheExtensions
{
    public static IServiceCollection AddCaching(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var cacheOptions = configuration
            .GetSection(CacheOptions.SectionName)
            .Get<CacheOptions>();

        if (cacheOptions?.UseInMemoryCache == true)
        {
            services.AddDistributedMemoryCache();
        }
        else
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = cacheOptions?.RedisConnectionString;
            });
        }

        return services;
    }
}