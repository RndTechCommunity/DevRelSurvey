using Microsoft.EntityFrameworkCore;
using Prometheus;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Implementation.QueryHandlers.Filters;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

var builder = WebApplication.CreateSlimBuilder(args);

if (builder.Environment.IsDevelopment())
{
	// Add in-memory cache for development
	builder.Services.AddDistributedMemoryCache();
}
else
{
	// Add Redis cache on production environment
	var redisConfiguration = Environment.GetEnvironmentVariable("DEVRELAPP_CONFIG_REDIS");
	builder.Services.AddStackExchangeRedisCache(options =>
	{
		options.Configuration = redisConfiguration;
	});
}

// Add database with raw data
var surveyDbConnectionString = Environment.GetEnvironmentVariable("DEVRELAPP_CONFIG_DATABASE");
builder.Services.AddDbContextFactory<SurveyDbContext>(options =>
		options.UseMySql(
			surveyDbConnectionString,
			ServerVersion.AutoDetect(surveyDbConnectionString),
			optionsBuilder => optionsBuilder.CommandTimeout(120))
	);

builder.Services.AddSingleton<IIntervieweesDataProvider, IntervieweesPreloadedDataProvider>();

// Add query handlers to handle client requests
builder.Services.AddQueryHandler<GetCompanyModelsQuery, CompanyModel[], GetCompanyModelsQueryHandler>();
builder.Services.AddQueryHandler<GetMetaQuery, MetaModel, GetMetaQueryHandler>();
builder.Services.AddQueryHandler<GetCitiesQuery, string[], GetCitiesQueryHandler>();
builder.Services.AddQueryHandler<GetCommunitySourcesQuery, string[], GetCommunitySourcesQueryHandler>();
builder.Services.AddQueryHandler<GetExperienceLevelsQuery, string[], GetExperienceLevelsQueryHandler>();
builder.Services.AddQueryHandler<GetEducationsQuery, string[], GetEducationsQueryHandler>();
builder.Services.AddQueryHandler<GetProfessionsQuery, string[], GetProfessionsQueryHandler>();
builder.Services.AddQueryHandler<GetProgrammingLanguagesQuery, string[], GetProgrammingLanguagesQueryHandler>();

var app = builder.Build();

var port = Environment.GetEnvironmentVariable("PORT") ?? "29500";
app.Urls.Add($"http://*:{port}");

if (!app.Environment.IsDevelopment())
{
	app.UseHsts();
}

// Capture metrics about all received HTTP requests.
app.UseHttpMetrics();
// Enable the /metrics page to export Prometheus metrics.
app.MapMetrics();

app.UseHttpsRedirection();
app.UseStaticFiles();

// Map endpoints for client requests
app.MapResultRoutes();
app.MapFilterRoutes();

app.MapFallbackToFile("index.html");

// Preload data from DB
WarmUp(app);

app.Run();

void WarmUp(WebApplication webApplication)
{
	webApplication.Services.GetRequiredService<IIntervieweesDataProvider>();
}