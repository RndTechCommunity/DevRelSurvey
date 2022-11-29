using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Mapping;

public static class FilterMappers
{
	public static TQuery ToQuery<TQuery>(this UserFilter filter) where TQuery : IFilteredIntervieweesQuery, new()
	{
		var ageFilter = GetAgeFilter(filter);
		var communityFilter = GetCommunityFilter(filter);
		var languagesFilter = UpdateLanguagesFilter(filter);

		return new TQuery
		{
			Ages = ageFilter,
			Cities = filter.Cities,
			Educations = filter.Educations,
			Experiences = filter.Experiences,
			Professions = filter.Professions,
			ProgrammingLanguages = languagesFilter,
			IsCommunity = communityFilter,
		};
	}
	
	private static string[] UpdateLanguagesFilter(UserFilter filter) =>
		filter.Languages.Any() && (filter.Languages.Contains("TypeScript") || filter.Languages.Contains("JavaScript"))
			? filter.Languages.Concat(new[] { "JavaScript / TypeScript" }).ToArray()
			: filter.Languages;

	private static bool? GetCommunityFilter(UserFilter filter) =>
		filter.IsCommunity switch
		{
			"Да" => true,
			"Нет" => false,
			_ => null
		};

	private static int[] GetAgeFilter(UserFilter filter) =>
		filter.Ages
			.Select(age => int.Parse(age.Substring(0, 2)))
			.SelectMany(af => Enumerable.Range(af, 5))
			.ToArray();
}
