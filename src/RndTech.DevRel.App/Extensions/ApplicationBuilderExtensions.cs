using Prometheus;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;

namespace RndTech.DevRel.App.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication ConfigureMiddlewarePipeline(this WebApplication app)
    {
        // Настройка порта
        var serverOptions = app.Configuration
            .GetSection(ServerOptions.SectionName)
            .Get<ServerOptions>();
        var port = Environment.GetEnvironmentVariable("PORT") ??
                  serverOptions?.Port.ToString() ??
                  "29500";
        app.Urls.Add($"http://*:{port}");

        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        // Метрики Prometheus
        app.UseHttpMetrics();
        app.MapMetrics();

        // Стандартный ASP.NET Core pipeline
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.MapControllers();
        app.MapFallbackToFile("index.html");

        return app;
    }

    public static IServiceProvider WarmUpApplication(this IServiceProvider services)
    {
        // Предзагрузка данных в память
        services.GetRequiredService<IIntervieweesDataProvider>();
        return services;
    }

    public static IServiceProvider ValidateConfiguration(this IServiceProvider services)
    {
        // Валидация конфигурации
        ConfigurationValidator.ValidateConfiguration(services);
        return services;
    }
}