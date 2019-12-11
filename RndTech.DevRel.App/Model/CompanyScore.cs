using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	/// <summary>
	/// Атом оценки компании респондентом.
	/// </summary>
	public class CompanyScore
	{
		/// <summary>
		/// Название компании.
		/// </summary>
		public string CompanyName { get; set; }

		/// <summary>
		/// Знает ли респондент компанию.
		/// </summary>
		public bool IsKnown { get; set; }

		/// <summary>
		/// Хочет ли респондент работать в компании.
		/// </summary>
		public bool IsWanted { get; set; }

		/// <summary>
		/// Возраст респондента.
		/// </summary>
		public int Age { get; set; }

		/// <summary>
		/// Город респондента.
		/// </summary>
		public string City { get; set; }

		/// <summary>
		/// Образование респондента.
		/// </summary>
		public string Education { get; set; }

		/// <summary>
		/// Грейд респондента (самооценка).
		/// </summary>
		public string ExperienceLevel { get; set; }

		/// <summary>
		/// Опыт работы, полных лет.
		/// </summary>
		public int ExperienceYears { get; set; }

		/// <summary>
		/// Профессия респондента.
		/// </summary>
		public string Profession { get; set; }

		/// <summary>
		/// Языки программирования.
		/// </summary>
		public List<string> ProgrammingLanguages { get; set; }

		/// <summary>
		/// Откуда респондент узнает информацию о компаниях.
		/// </summary>
		public List<string> CompanySources { get; set; }

		/// <summary>
		/// Ходит ли респондент на митапы/конференции.
		/// </summary>
		public bool IsCommunity { get; set; }

		/// <summary>
		/// Откуда респондент узнаёт о митапах.
		/// </summary>
		public List<string> CommunitySource { get; set; }

		/// <summary>
		/// Уникальный идентификатор респондента.
		/// </summary>
		public int IntervieweeId { get; set; }
	}
}
