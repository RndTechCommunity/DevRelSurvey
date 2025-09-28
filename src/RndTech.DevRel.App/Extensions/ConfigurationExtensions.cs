using RndTech.DevRel.App.Configuration;

namespace RndTech.DevRel.App.Extensions;

public static class ConfigurationExtensions
{
    public static IServiceCollection AddApplicationConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Регистрация всех Options классов
        services.Configure<DatabaseOptions>(
            configuration.GetSection(DatabaseOptions.SectionName));
        services.Configure<CacheOptions>(
            configuration.GetSection(CacheOptions.SectionName));
        services.Configure<ServerOptions>(
            configuration.GetSection(ServerOptions.SectionName));

        return services;
    }
}