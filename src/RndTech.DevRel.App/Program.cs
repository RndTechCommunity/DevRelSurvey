using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Prometheus;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Repositories;
using RndTech.DevRel.App.Services;
using RndTech.DevRel.App.Services.Decorators;
using RndTech.DevRel.Database;

var builder = WebApplication.CreateSlimBuilder(args);

// Configure application settings
EnvironmentVariablesProvider.ConfigureEnvironmentVariables(builder.Configuration);
builder.Services.AddApplicationConfiguration(builder.Configuration);

// Configure cache based on environment
var cacheOptions = builder.Configuration.GetSection(CacheOptions.SectionName).Get<CacheOptions>();
if (cacheOptions?.UseInMemoryCache == true)
{
	// Add in-memory cache for development
	builder.Services.AddDistributedMemoryCache();
}
else
{
	// Add Redis cache on production environment
	builder.Services.AddStackExchangeRedisCache(options =>
	{
		options.Configuration = cacheOptions?.RedisConnectionString;
	});
}

// Add database with raw data
var databaseOptions = builder.Configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>();
builder.Services.AddDbContextFactory<SurveyDbContext>(options =>
		options.UseMySql(
			databaseOptions?.ConnectionString,
			ServerVersion.AutoDetect(databaseOptions?.ConnectionString),
			optionsBuilder => optionsBuilder.CommandTimeout(databaseOptions?.CommandTimeout ?? 120))
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
    new CachedCompanyService(
        provider.GetRequiredService<CompanyService>(),
        provider.GetRequiredService<IDistributedCache>(),
        provider.GetRequiredService<IOptions<CacheOptions>>()));
builder.Services.AddScoped<IMetaService>(provider =>
    new CachedMetaService(
        provider.GetRequiredService<MetaService>(),
        provider.GetRequiredService<IDistributedCache>(),
        provider.GetRequiredService<IOptions<CacheOptions>>()));
builder.Services.AddScoped<IFilterService>(provider =>
    new CachedFilterService(
        provider.GetRequiredService<FilterService>(),
        provider.GetRequiredService<IDistributedCache>(),
        provider.GetRequiredService<IOptions<CacheOptions>>()));

// Add controllers
builder.Services.AddControllers();

var app = builder.Build();

// Validate configuration
ConfigurationValidator.ValidateConfiguration(app.Services);

// Configure server port
var serverOptions = builder.Configuration.GetSection(ServerOptions.SectionName).Get<ServerOptions>();
var port = Environment.GetEnvironmentVariable("PORT") ?? serverOptions?.Port.ToString() ?? "29500";
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