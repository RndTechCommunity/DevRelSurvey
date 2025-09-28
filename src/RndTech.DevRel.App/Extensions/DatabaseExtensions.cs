using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(
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
}