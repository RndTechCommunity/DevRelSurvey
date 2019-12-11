using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Controllers
{
	[Route("api/")]
	public class FiltersController : Controller
	{
		[Route("cities")]
		public List<string> GetCities()
		{
			return InMemoryDbContext.GetCities();
		}

		[Route("communitySources")]
		public List<string> GetCommunitySources()
		{
			return InMemoryDbContext.GetCommunitySources();
		}

		[Route("companySources")]
		public List<string> GetCompanySources()
		{
			return InMemoryDbContext.GetCompanySources();
		}

		[Route("educations")]
		public List<string> GetEducations()
		{
			return InMemoryDbContext.GetEducations();
		}

		[Route("experienceLevels")]
		public List<string> GetExperienceLevels()
		{
			return InMemoryDbContext.GetExperienceLevels();
		}

		[Route("professions")]
		public List<string> GetProfessions()
		{
			return InMemoryDbContext.GetProfessions();
		}

		[Route("programmingLanguages")]
		public List<string> GetProgrammingLanguages()
		{
			return InMemoryDbContext.GetProgrammingLanguages();
		}
	}
}
