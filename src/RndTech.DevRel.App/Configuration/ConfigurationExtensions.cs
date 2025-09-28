using Microsoft.Extensions.Options;

namespace RndTech.DevRel.App.Configuration;

public static class ConfigurationExtensions
{
    public static IServiceCollection AddApplicationConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionName));
        services.Configure<CacheOptions>(configuration.GetSection(CacheOptions.SectionName));
        services.Configure<ServerOptions>(configuration.GetSection(ServerOptions.SectionName));

        // Добавить валидацию
        services.AddOptionsWithValidation<DatabaseOptions>();
        services.AddOptionsWithValidation<CacheOptions>();
        services.AddOptionsWithValidation<ServerOptions>();

        return services;
    }

    private static IServiceCollection AddOptionsWithValidation<T>(this IServiceCollection services)
        where T : class
    {
        services.AddSingleton<IValidateOptions<T>, DataAnnotationValidateOptions<T>>();
        return services;
    }
}