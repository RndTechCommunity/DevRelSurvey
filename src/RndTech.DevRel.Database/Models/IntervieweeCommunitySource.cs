namespace RndTech.DevRel.Database.Models;

public class IntervieweeCommunitySource
{
	public Guid IntervieweeId { get; set; }
	public Interviewee Interviewee { get; set; }
		
	public Guid CommunitySourceId { get; set; }
	public CommunitySource CommunitySource { get; set; }
}