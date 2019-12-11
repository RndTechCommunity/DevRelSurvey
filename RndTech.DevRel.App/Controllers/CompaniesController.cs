using Microsoft.AspNetCore.Mvc;
using RndTech.DevRel.App.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
	
namespace RndTech.DevRel.App.Controllers
{
	[Route("api/")]
	public class CompanyController : Controller
	{
		[Route("all-companies")]
		public List<CompanyModel> All()
		{
			return InMemoryDbContext.GetCompanyModels();
		}

		[Route("known-and-wanted")]
		public List<CompanyModel> GetCompanies(string cities, string educations, string languages, string professions, string experiences, string ages)
		{
			var citiesFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(cities).ToList();
			var educationFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(educations).ToList();
			var languagesFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(languages).ToList();
			var professionFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(professions).ToList();
			var experienceLevelFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(experiences).ToList();
			var ageFilter = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(ages).Select(a => int.Parse(a)).ToList();

			return InMemoryDbContext.GetCompanyModels(
				citiesFilter: citiesFilter, 
				educationFilter: educationFilter, 
				programmingLanguageFilter: languagesFilter, 
				professionFilter: professionFilter,
				experienceLevelFilter: experienceLevelFilter,
				agesFilter: ageFilter);
		}
	}
}
