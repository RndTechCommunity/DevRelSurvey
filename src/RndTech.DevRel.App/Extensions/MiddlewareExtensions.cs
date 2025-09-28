using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Infrastructure;

namespace RndTech.DevRel.App.Extensions;

/// <summary>
/// Extension methods для настройки middleware pipeline.
/// </summary>
public static class MiddlewareExtensions
{
    /// <summary>
    /// Настраивает middleware pipeline для DevRel приложения.
    /// </summary>
    public static WebApplication ConfigureDevRelPipeline(this WebApplication app)
    {
        // Настройка порта
        ConfigureServerPort(app);

        // Настройка HTTPS для production
        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        // Стандартный ASP.NET Core pipeline
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.MapControllers();
        app.MapFallbackToFile("index.html");

        return app;
    }

    /// <summary>
    /// Выполняет предзагрузку данных в память.
    /// </summary>
    public static Task<WebApplication> WarmUpApplicationAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        // Предзагрузка данных в память
        scope.ServiceProvider.GetRequiredService<IIntervieweesDataProvider>();

        return Task.FromResult(app);
    }

    private static void ConfigureServerPort(WebApplication app)
    {
        var serverOptions = app.Configuration
            .GetSection(ServerOptions.SectionName)
            .Get<ServerOptions>();
        var port = Environment.GetEnvironmentVariable("PORT") ??
                  serverOptions?.Port.ToString() ??
                  "29500";
        app.Urls.Add($"http://*:{port}");
    }
}