using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	/// <summary>
	/// Данные о составе выборки, оответствующей фильтрм.
	/// </summary>
	public class MetaModel
	{
		/// <summary>
		/// Число респондентов в выборке.
		/// </summary>
		public int count { get; set; }
		
		/// <summary>
		/// Общее число респондентов за год.
		/// </summary>
		public int Total { get; set; }
		
		/// <summary>
		/// Метаданные выборки.
		/// В ключе указан один из доступных ключей с данными, например, cities, ages.
		/// В значении словаря указаны пары "значение, количество участников". Например, "Таганрог": "215".
		/// </summary>
		public Dictionary<string, Dictionary<string, int>> sources { get; set; }
	}
}
