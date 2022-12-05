namespace RndTech.DevRel.Database.Models;

public class IntervieweeLanguage
{
	public Guid IntervieweeId { get; set; }
	public Interviewee Interviewee { get; set; } = null!;

	public Guid LanguageId { get; set; }
	public Language Language { get; set; } = null!;
}