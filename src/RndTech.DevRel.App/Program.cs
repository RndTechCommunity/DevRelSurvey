using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Implementation.QueryHandlers.Filters;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.Heroku.json");

builder.Services.AddControllersWithViews();
builder.Services.AddEnyimMemcached();

var connectionString = builder.Configuration.GetConnectionString("SurveyDb")!;
builder.Services.AddDbContextFactory<SurveyDbContext>(options =>
	options
		.UseMySql(
			connectionString,
			ServerVersion.AutoDetect(connectionString),
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

if (!app.Environment.IsDevelopment())
{
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseEnyimMemcached();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
