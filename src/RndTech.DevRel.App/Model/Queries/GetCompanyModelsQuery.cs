namespace RndTech.DevRel.App.Model.Queries;

public record GetCompanyModelsQuery : IFilteredIntervieweesQuery
{
	public int[] Ages { get; init; } = null!;
	public string[] Cities { get; init; } = null!;
	public string[] Educations { get; init; } = null!;
	public string[] Experiences { get; init; } = null!;
	public string[] Professions { get; init; } = null!;
	public string[] ProgrammingLanguages { get; init; } = null!;
	public bool? IsCommunity { get; init; }
}
