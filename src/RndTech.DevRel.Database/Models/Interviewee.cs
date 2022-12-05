namespace RndTech.DevRel.Database.Models;

public class Interviewee
{
	public Guid Id { get; set; }
	public int Age { get; set; }
	public string Education { get; set; }
	public string Profession { get; set; }
	public string ProfessionLevel { get; set; }
	public string City { get; set; }
	public bool VisitMeetups { get; set; }
	public int Year { get; set; }
	public bool IsCommunity { get; set; }

	public ICollection<CompanyAnswer> CompanyAnswers { get; set; }
	public ICollection<IntervieweeLanguage> Languages { get; set; }
	public ICollection<IntervieweeCommunitySource> CommunitySources { get; set; }
		
		
}