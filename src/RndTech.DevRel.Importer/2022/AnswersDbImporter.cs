using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.Database;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Importer._2022;

public static class AnswersDbImporter
{
	public static void Import(string connectionString, AnswerFileModel[] answers)
	{
		var dbInterviewees = new List<Interviewee>();
		var dbIntervieweeLanguages = new List<IntervieweeLanguage>();
		var dbIntervieweeCommunitySources = new List<IntervieweeCommunitySource>();
		var dbCompanyAnswers = new List<CompanyAnswer>();
		
		var db = CreateDbContext(connectionString);
		var languages = db.Languages.ToArray();
		var communitySources = db.CommunitySources.ToArray();
		var companies = db.Companies.ToArray();

		foreach (var answer in answers)
		{
			var interviewee = new Interviewee
			{
				Year = 2022,
				City = !string.IsNullOrWhiteSpace(answer.City) ? answer.City : answer.CityNotInList,
				Age = answer.Age!.Value,
				Profession = answer.Profession,
				Education = answer.Education,
				IsCommunity = answer.VisitMeetups,
				VisitMeetups = answer.VisitMeetups,
				ProfessionLevel = answer.ProfessionLevel
			};

			var intervieweeLanguages = GetIntervieweeLanguages(answer, languages, interviewee);
			interviewee.Languages = intervieweeLanguages;

			var intervieweeCommunitySources = GetIntervieweeCommunitySources(answer, communitySources, interviewee);
			interviewee.CommunitySources = intervieweeCommunitySources;
			
			var companyAnswers = GetCompanyAnswers(answer, companies, interviewee);
			interviewee.CompanyAnswers = companyAnswers;

			dbInterviewees.Add(interviewee);
			dbIntervieweeLanguages.AddRange(intervieweeLanguages);
			dbIntervieweeCommunitySources.AddRange(intervieweeCommunitySources);
			dbCompanyAnswers.AddRange(companyAnswers);
		}

		db.Interviewees.AddRange(dbInterviewees);
		db.IntervieweeLanguages.AddRange(dbIntervieweeLanguages);
		db.IntervieweeCommunitySources.AddRange(dbIntervieweeCommunitySources);
		db.CompanyAnswers.AddRange(dbCompanyAnswers);

		db.SaveChanges();
	}

	private static List<CompanyAnswer> GetCompanyAnswers(AnswerFileModel answer, Company[] companies, Interviewee interviewee)
	{
		var answers = new List<CompanyAnswer>();

		foreach (var answerModel in answer.GetCompanyAnswerFileModels())
		{
			var dbSource = companies.SingleOrDefault(l => l.Name == answerModel.CompanyName);
			if (dbSource == null)
			{
				Console.WriteLine($"Where is {answerModel.CompanyName}?");
				throw new Exception($"Where is {answerModel.CompanyName}?");
			}

			var companyAnswer = new CompanyAnswer
			{
				Interviewee = interviewee,
				Company =dbSource,
				IsKnown = answerModel.IsKnown,
				IsGood = answerModel.IsGood,
				IsWanted = answerModel.IsWanted
			};

			answers.Add(companyAnswer);
		}

		return answers;
	}

	private static List<IntervieweeCommunitySource> GetIntervieweeCommunitySources(AnswerFileModel answer, CommunitySource[] communitySources, Interviewee interviewee)
	{
		var sources = new List<IntervieweeCommunitySource>();

		foreach (var meetupSource in answer.GetMeetupSources())
		{
			var ms = meetupSource;
			if (meetupSource.StartsWith("Друзья / коллеги рассказ"))
				ms = "От друзей / коллег";
			
			var dbSource = communitySources.SingleOrDefault(l => l.Name == ms);
			if (dbSource == null)
			{
				Console.WriteLine($"Where is {ms}?");
				throw new Exception($"Where is {ms}?");
			}

			var intervieweeCommunitySource = new IntervieweeCommunitySource
			{
				Interviewee = interviewee,
				CommunitySource = dbSource
			};

			sources.Add(intervieweeCommunitySource);
		}

		return sources;
	}

	private static List<IntervieweeLanguage> GetIntervieweeLanguages(AnswerFileModel answer, Language[] languages, Interviewee interviewee)
	{

		var intervieweeLanguages = new List<IntervieweeLanguage>();

		foreach (var programmingLanguage in answer.GetProgrammingLanguages())
		{
			var language = languages.SingleOrDefault(l => l.Name == programmingLanguage);
			if (language == null)
			{
				Console.WriteLine($"Where is {programmingLanguage} language?");
				throw new Exception($"Where is {programmingLanguage} language?");
			}

			var intervieweeLanguage = new IntervieweeLanguage()
			{
				Interviewee = interviewee,
				Language = language
			};

			intervieweeLanguages.Add(intervieweeLanguage);
		}

		return intervieweeLanguages;
	}

	private static SurveyDbContext CreateDbContext(string connectionString)
	{
		var dbContextOptionsBuilder = new DbContextOptionsBuilder<SurveyDbContext>();
		dbContextOptionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
		return new SurveyDbContext(dbContextOptionsBuilder.Options);
	}
}
