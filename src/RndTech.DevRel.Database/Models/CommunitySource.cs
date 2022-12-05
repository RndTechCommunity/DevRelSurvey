namespace RndTech.DevRel.Database.Models;

public class CommunitySource
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public ICollection<IntervieweeCommunitySource> Interviewees { get; set; }
}