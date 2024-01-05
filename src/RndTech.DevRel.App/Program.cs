using Microsoft.EntityFrameworkCore;
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
	builder.Services.AddDistributedMemoryCache();
}
else
{
	var redisConfiguration = Environment.GetEnvironmentVariable("DEVRELAPP_CONFIG_REDIS");
	builder.Services.AddStackExchangeRedisCache(options =>
	{
		options.Configuration = redisConfiguration;
	});
}

var surveyDbConnectionString = Environment.GetEnvironmentVariable("DEVRELAPP_CONFIG_DATABASE");
builder.Services.AddDbContextFactory<SurveyDbContext>(options =>
		options.UseMySql(
			surveyDbConnectionString,
			ServerVersion.AutoDetect(surveyDbConnectionString),
			optionsBuilder => optionsBuilder.CommandTimeout(120))
	);

builder.Services.AddSingleton<IIntervieweesDataProvider, IntervieweesPreloadedDataProvider>();
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

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapResultRoutes();
app.MapFilterRoutes();

app.MapFallbackToFile("index.html");

WarmUp(app);

app.Run();

void WarmUp(WebApplication webApplication)
{
	webApplication.Services.GetRequiredService<IIntervieweesDataProvider>();
}