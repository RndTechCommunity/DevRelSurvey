using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Prometheus;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Repositories;
using RndTech.DevRel.App.Services;
using RndTech.DevRel.App.Services.Decorators;
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

// Add repositories
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IIntervieweeRepository, IntervieweeRepository>();
builder.Services.AddScoped<IFilterRepository, FilterRepository>();

// Add services
builder.Services.AddScoped<CompanyService>();
builder.Services.AddScoped<MetaService>();
builder.Services.AddScoped<FilterService>();

// Add cached service decorators
builder.Services.AddScoped<ICompanyService>(provider =>
    new CachedCompanyService(provider.GetRequiredService<CompanyService>(), provider.GetRequiredService<IDistributedCache>()));
builder.Services.AddScoped<IMetaService>(provider =>
    new CachedMetaService(provider.GetRequiredService<MetaService>(), provider.GetRequiredService<IDistributedCache>()));
builder.Services.AddScoped<IFilterService>(provider =>
    new CachedFilterService(provider.GetRequiredService<FilterService>(), provider.GetRequiredService<IDistributedCache>()));

// Add controllers
builder.Services.AddControllers();

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

// Map controllers
app.MapControllers();

app.MapFallbackToFile("index.html");

// Preload data from DB
WarmUp(app);

app.Run();

void WarmUp(WebApplication webApplication)
{
	webApplication.Services.GetRequiredService<IIntervieweesDataProvider>();
}