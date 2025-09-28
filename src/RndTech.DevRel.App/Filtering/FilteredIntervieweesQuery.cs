namespace RndTech.DevRel.App.Filtering;

public class FilteredIntervieweesQuery
{
    public int[] Ages { get; set; } = Array.Empty<int>();
    public string[] Cities { get; set; } = Array.Empty<string>();
    public string[] Educations { get; set; } = Array.Empty<string>();
    public string[] Experiences { get; set; } = Array.Empty<string>();
    public string[] Professions { get; set; } = Array.Empty<string>();
    public string[] ProgrammingLanguages { get; set; } = Array.Empty<string>();
    public bool? IsCommunity { get; set; }
}