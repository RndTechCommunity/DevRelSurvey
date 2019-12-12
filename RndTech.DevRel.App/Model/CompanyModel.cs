using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	public class CompanyModel
	{
		public string Name { get; set; }
		public double KnownLevel { get; set; }
		public double WantedLevel { get; set; }
		public double Error { get; set; } = 0;
	}
}
