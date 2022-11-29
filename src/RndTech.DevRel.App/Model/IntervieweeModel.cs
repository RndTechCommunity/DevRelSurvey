namespace RndTech.DevRel.App.Model;

public record IntervieweeModel(Guid Id,
	int Age,
	string Education,
	string Profession,
	string ProfessionLevel,
	string City,
	bool VisitMeetups,
	int Year,
	string[] Languages,
	string[] CommunitySources);
