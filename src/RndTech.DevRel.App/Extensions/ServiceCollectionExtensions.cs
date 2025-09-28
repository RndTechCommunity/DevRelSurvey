using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.App.QueryHandlers;
using RndTech.DevRel.App.QueryHandlers.Decorators;
using RndTech.DevRel.App.Services;

namespace RndTech.DevRel.App.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDevRelApplication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Конфигурация
        services.AddApplicationConfiguration(configuration);

        // База данных
        services.AddDatabase(configuration);

        // Кэширование
        services.AddCaching(configuration);

        // Query Handlers с кэшированием (автоматическое сканирование)
        services.AddQueryHandlersWithAutomaticScanning();

        // Контроллеры
        services.AddControllers();

        return services;
    }

    public static IServiceCollection AddCachedQueryHandler<TQuery, TResult, THandler>(
        this IServiceCollection services)
        where TQuery : class, IQuery<TResult>
        where THandler : class, IQueryHandler<TQuery, TResult>
    {
        // Регистрируем основной handler
        services.AddScoped<THandler>();

        // Регистрируем кэширующий декоратор
        services.AddScoped<IQueryHandler<TQuery, TResult>>(provider =>
        {
            var innerHandler = provider.GetRequiredService<THandler>();
            var cacheService = provider.GetRequiredService<ICacheService>();
            var cacheOptions = provider.GetRequiredService<IOptions<CacheOptions>>();
            var logger = provider.GetRequiredService<ILogger<CachingQueryHandlerDecorator<TQuery, TResult>>>();

            return new CachingQueryHandlerDecorator<TQuery, TResult>(
                innerHandler, cacheService, cacheOptions, logger);
        });

        return services;
    }

    public static IServiceCollection AddQueryHandlers(this IServiceCollection services)
    {
        // Регистрируем кэш-сервис
        services.AddScoped<ICacheService, CacheService>();

        // Регистрируем query handlers с кэшированием
        services.AddCachedQueryHandler<GetCompanyModelsQuery, CompanyModel[], GetCompanyModelsQueryHandler>();
        services.AddCachedQueryHandler<GetMetaQuery, MetaModel, GetMetaQueryHandler>();
        services.AddCachedQueryHandler<GetCitiesQuery, string[], GetCitiesQueryHandler>();
        services.AddCachedQueryHandler<GetCommunitySourcesQuery, string[], GetCommunitySourcesQueryHandler>();
        services.AddCachedQueryHandler<GetEducationsQuery, string[], GetEducationsQueryHandler>();
        services.AddCachedQueryHandler<GetExperienceLevelsQuery, string[], GetExperienceLevelsQueryHandler>();
        services.AddCachedQueryHandler<GetProfessionsQuery, string[], GetProfessionsQueryHandler>();
        services.AddCachedQueryHandler<GetProgrammingLanguagesQuery, string[], GetProgrammingLanguagesQueryHandler>();

        return services;
    }
}