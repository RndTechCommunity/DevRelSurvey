using System.Reflection;
using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Queries;
using RndTech.DevRel.App.QueryHandlers;
using RndTech.DevRel.App.QueryHandlers.Decorators;
using RndTech.DevRel.App.Services;

namespace RndTech.DevRel.App.Extensions;

public static class QueryHandlerExtensions
{
    public static IServiceCollection AddQueryHandlersWithAutomaticScanning(this IServiceCollection services)
    {
        // Регистрируем кэш-сервис
        services.AddScoped<ICacheService, CacheService>();

        var assembly = Assembly.GetExecutingAssembly();

        // Находим все QueryHandler'ы
        var handlerTypes = assembly.GetTypes()
            .Where(t => t.GetInterfaces()
                .Any(i => i.IsGenericType &&
                         i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>)))
            .Where(t => !t.IsAbstract && !t.IsInterface && !t.IsGenericType);

        foreach (var handlerType in handlerTypes)
        {
            var interfaceType = handlerType.GetInterfaces()
                .First(i => i.IsGenericType &&
                           i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>));

            var genericArgs = interfaceType.GetGenericArguments();
            var queryType = genericArgs[0];
            var resultType = genericArgs[1];

            // Регистрируем основной handler
            services.AddScoped(handlerType);

            // Создаем кэширующий декоратор
            var decoratorType = typeof(CachingQueryHandlerDecorator<,>)
                .MakeGenericType(queryType, resultType);

            services.AddScoped(interfaceType, provider =>
            {
                var innerHandler = provider.GetRequiredService(handlerType);
                var cacheService = provider.GetRequiredService<ICacheService>();
                var cacheOptions = provider.GetRequiredService<IOptions<CacheOptions>>();
                var loggerType = typeof(ILogger<>).MakeGenericType(decoratorType);
                var logger = provider.GetRequiredService(loggerType);

                return Activator.CreateInstance(decoratorType, innerHandler, cacheService, cacheOptions, logger)!;
            });
        }

        return services;
    }
}