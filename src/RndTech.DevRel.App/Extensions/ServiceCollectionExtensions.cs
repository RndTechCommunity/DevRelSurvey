using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Infrastructure;
using RndTech.DevRel.App.Services;
using RndTech.DevRel.App.Services.Decorators;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDevRelServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddApplicationConfiguration(configuration);
        services.AddDatabase(configuration);
        services.AddCaching(configuration);
        services.AddApplicationServices();
        return services;
    }

    private static IServiceCollection AddApplicationConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CacheOptions>()
            .Bind(configuration.GetSection(CacheOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<ServerOptions>()
            .Bind(configuration.GetSection(ServerOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<FilterOptions>()
            .Bind(configuration.GetSection(FilterOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    private static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var databaseOptions = configuration
            .GetSection(DatabaseOptions.SectionName)
            .Get<DatabaseOptions>();

        services.AddDbContextFactory<SurveyDbContext>(options =>
            options.UseMySql(
                databaseOptions?.ConnectionString,
                ServerVersion.AutoDetect(databaseOptions?.ConnectionString),
                optionsBuilder => optionsBuilder.CommandTimeout(
                    databaseOptions?.CommandTimeout ?? 120)));

        services.AddSingleton<IIntervieweesDataProvider, IntervieweesPreloadedDataProvider>();

        return services;
    }

    private static IServiceCollection AddCaching(
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

    private static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ICacheService, CacheService>();
        services.AddScoped<FilterValueConverter>();

        services.AddScoped<FilteringService>();
        services.AddScoped<IFilteringService>(provider => provider.GetRequiredService<FilteringService>());
        services.AddScoped<CompanyService>();
        services.AddScoped<MetaService>();
        services.AddScoped<FilterService>();

        services.AddCachedService<ICompanyService, CompanyService, CachedCompanyService>();
        services.AddCachedService<IMetaService, MetaService, CachedMetaService>();
        services.AddCachedService<IFilterService, FilterService, CachedFilterService>();

        return services;
    }

    private static IServiceCollection AddCachedService<TInterface, TImplementation, TCachedImplementation>(
        this IServiceCollection services)
        where TInterface : class
        where TImplementation : class, TInterface
        where TCachedImplementation : class, TInterface
    {
        services.AddScoped<TInterface>(provider =>
            (TInterface)Activator.CreateInstance(
                typeof(TCachedImplementation),
                provider.GetRequiredService<TImplementation>(),
                provider.GetRequiredService<ICacheService>(),
                provider.GetRequiredService<IOptions<CacheOptions>>(),
                provider.GetRequiredService(typeof(ILogger<>).MakeGenericType(typeof(TCachedImplementation))))!);

        return services;
    }

}