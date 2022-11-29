namespace RndTech.DevRel.Database.Models;

public class Language
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public ICollection<IntervieweeLanguage> Interviewees { get; set; } 
}