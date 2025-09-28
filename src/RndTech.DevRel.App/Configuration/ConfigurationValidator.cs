using Microsoft.Extensions.Options;

namespace RndTech.DevRel.App.Configuration;

public static class ConfigurationValidator
{
    public static void ValidateConfiguration(IServiceProvider services)
    {
        // Принудительно создать все опции для валидации
        try
        {
            _ = services.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            _ = services.GetRequiredService<IOptions<CacheOptions>>().Value;
            _ = services.GetRequiredService<IOptions<ServerOptions>>().Value;
        }
        catch (OptionsValidationException ex)
        {
            throw new InvalidOperationException($"Configuration validation failed: {ex.Message}", ex);
        }
    }
}