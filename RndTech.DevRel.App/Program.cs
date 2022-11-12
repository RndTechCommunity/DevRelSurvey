using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RndTech.DevRel.App.DAL;
using RndTech.DevRel.App.Model;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Configuration.AddJsonFile("appsettings.Heroku.json");

builder.Services.AddMvc();
builder.Services.AddEnyimMemcached(builder.Configuration.GetSection("enyimMemcached"));

builder.Services.AddSpaStaticFiles(configuration =>
{
	configuration.RootPath = "ClientApp/build";
});

var connectionString = builder.Configuration.GetConnectionString("SurveyDb") ??
						throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContextPool<SurveyDbContext>(optionsBuilder =>
	optionsBuilder
		.UseMySql(
			connectionString,
			new MariaDbServerVersion(new Version(10, 4)),
			mySqlOptions =>
			{
				mySqlOptions.CommandTimeout(120);
			})
);

builder.Services.AddScoped<SurveyService>();
builder.Services.AddScoped<IntervieweesPreloader>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSpaStaticFiles();
app.UseEnyimMemcached();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.UseSpa(spa =>
{
	spa.Options.SourcePath = "ClientApp";

	if (app.Environment.IsDevelopment())
	{
		spa.UseReactDevelopmentServer(npmScript: "start");
	}
});

using (var scope = app.Services.CreateScope())
{
	var context = scope.ServiceProvider.GetRequiredService<SurveyDbContext>();
	DbInitializer.Initialize(context);
	scope.ServiceProvider.GetRequiredService<IntervieweesPreloader>();
}

await app.RunAsync();
