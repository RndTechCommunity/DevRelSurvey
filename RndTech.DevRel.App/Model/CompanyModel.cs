using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	/// <summary>
	/// Данные о узнаваемости и привлекательности компаний.
	/// </summary>
	public class CompanyModel
	{
		/// <summary>
		/// Название компании.
		/// </summary>
		public string Name { get; set; }
		
		/// <summary>
		/// Доля респондентов, которые знают компанию.
		/// </summary>
		public double KnownLevel { get; set; }
		
		/// <summary>
		/// Доля респондентов, которые хотят работать в компании.
		/// </summary>
		public double WantedLevel { get; set; }
		
		/// <summary>
		/// Доверительный интервал для доверительной вероятности 95%.
		/// </summary>
		public double Error { get; set; } = 0;
	}
}
