using System;
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using RndTech.DevRel.App.DAL;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		private IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_3_0);
			services.AddEnyimMemcached(Configuration);

			// In production, the React files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/build";
			});

			//services.AddDbContext<SurveyDbContext>(
			//	dbContextOptions => dbContextOptions
			//		.UseSqlite("Data Source=Survey.db"));
			services.AddDbContextPool<SurveyDbContext>(
					dbContextOptions => dbContextOptions
						.UseMySql(
							Configuration.GetConnectionString("SurveyDb"),
							new MariaDbServerVersion(new Version(10, 4)),
							mySqlOptions =>
							{
								mySqlOptions.CharSetBehavior(CharSetBehavior.NeverAppend);
								mySqlOptions.CommandTimeout(120);
							})
				);
			
			services.AddSwaggerGen();
			
			services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo
				{
					Version = "v1",
					Title = "RndTech devrel survey API",
					Description = "АПИ для доступа к данным опроса узнаваемости ИТ-компаний Ростовской области",
					Contact = new OpenApiContact
					{
						Name = "Вадим Мартынов",
						Email = string.Empty,
						Url = new Uri("https://vk.com/vadimyan"),
					},
				});

				// Set the comments path for the Swagger JSON and UI.
				var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
				var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
				c.IncludeXmlComments(xmlPath);
			});

			services.AddScoped<SurveyService>();
			services.AddScoped<IntervieweesPreloader>();

			services.AddHostedService<WarmUpHostedService>();
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Error");
				app.UseHsts();
			}
			
			app.UseSwagger();
			app.UseSwaggerUI(c =>
			{
				c.SwaggerEndpoint("v1/swagger.json", "RndTech devrel survey API");
			});

			app.UseHttpsRedirection();
			app.UseStaticFiles();
			app.UseSpaStaticFiles();
			app.UseEnyimMemcached();

			app.UseRouting();
			
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllerRoute("default", "{controller}/{action=Index}/{id?}");
			});

			app.UseSpa(spa =>
			{
				spa.Options.SourcePath = "ClientApp";

				if (env.IsDevelopment())
				{
					spa.UseReactDevelopmentServer(npmScript: "start");
				}
			});
		}
	}
}
