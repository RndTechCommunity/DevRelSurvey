using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	/// <summary>
	/// Данные о узнаваемости и привлекательности компаний.
	/// </summary>
	public record CompanyModel(string Name, 
		int Year, 
		double KnownLevel, 
		double GoodLevel, 
		double WantedLevel,
		int KnownVotes,
		int GoodVotes,
		int WantedVotes,
		int SelectionCount,
		double Error);
}
