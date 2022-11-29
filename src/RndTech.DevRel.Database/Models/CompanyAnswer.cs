namespace RndTech.DevRel.Database.Models;

public class CompanyAnswer
{
	public Guid Id { get; set; }
	public bool IsKnown { get; set; }
	public bool IsGood { get; set; }
	public bool IsWanted { get; set; }

	public Guid IntervieweeId { get; set; }
	public Interviewee Interviewee { get; set; }

	public Guid CompanyId { get; set; }
	public Company Company { get; set; }
}