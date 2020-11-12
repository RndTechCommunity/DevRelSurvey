using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using CsvHelper;
using CsvHelper.Configuration;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.DAL
{
    public static class DbInitializer
    {
        public static void Initialize(SurveyDbContext context)
        {
            int lId = 1, cId = 1, iId = 1, aId = 1;
            var languagesDict = new Dictionary<string, Language>();
            var companiesDict = new Dictionary<string, Company>();
            var interviewees = new List<Interviewee>();
            var answers = new List<CompanyAnswer>();

            context.Database.EnsureCreated();

            // Look for any students.
            if (context.Interviewees.Any())
            {
                return;   // DB has been seeded
            }
            
            using (var reader = new StreamReader("testdata.csv"))
            using (var csv = new CsvReader(reader,
                new CsvConfiguration(CultureInfo.InvariantCulture) {BadDataFound = null, Delimiter = ","}))
            {
                while (csv.Read())
                {
                    var firstTimeString = true;
                    Interviewee interviewee = null;

                    var companies = csv.GetField<string>(22).Split("\n");
                    foreach (var company in companies)
                    {
                        var cs = company.Split(":");
                        var companyScore = new CompanyScore
                        {
                            IntervieweeId = csv.GetField<int>(0),
                            CompanyName = cs[0].Trim('"'),
                            IsKnown = cs[1].Trim().StartsWith("Знаю") || cs[1].Trim().Equals("Слышал"),
                            IsWanted = cs[1].Trim().Equals("Знаю и хочу работать") ||
                                       cs[1].Trim().Equals("Знаю и уважаю"),
                            Age = csv.GetField<int>(8),
                            City = csv.GetField<string>(7),
                            Education = csv.GetField<string>(9),
                            ExperienceLevel = csv.GetField<string>(11),
                            ExperienceYears = csv.GetField<int>(10),
                            Profession = csv.GetField<string>(12),
                            ProgrammingLanguages = csv.GetField<string>(13).Split(",").Select(l => l.Trim()).ToList(),
                            CompanySources = csv.GetField<string>(15).Split(",").Select(l => l.Trim()).ToList(),
                            IsCommunity = csv.GetField<string>(18) == "Да",
                            CommunitySource = csv.GetField<string>(19).Split(",").Select(l => l.Trim()).ToList(),
                        };

                        if (!companiesDict.ContainsKey(companyScore.CompanyName))
                        {
                            var c = new Company() {Id = cId++, Name = companyScore.CompanyName};
                            companiesDict.Add(c.Name, c);
                        }

                        if (firstTimeString)
                        {
                            foreach (var language in companyScore.ProgrammingLanguages)
                            {
                                if (!languagesDict.ContainsKey(language))
                                {
                                    var l = new Language() {Id = lId++, Name = language};
                                    languagesDict.Add(l.Name, l);
                                }
                            }

                            interviewee = new Interviewee()
                            {
                                Id = iId++,
                                Age = companyScore.Age,
                                City = companyScore.City,
                                Education = companyScore.Education,
                                Profession = companyScore.Profession,
                                ProfessionLevel = companyScore.ExperienceLevel,
                                VisitMeetups = companyScore.IsCommunity
                            };
                            interviewees.Add(interviewee);
                            
                            foreach (var language in companyScore.ProgrammingLanguages)
                            {
                                context.IntervieweeLanguages.Add(new IntervieweeLanguage()
                                {
                                    IntervieweeId = interviewee.Id,
                                    LanguageId = languagesDict[language].Id
                                });
                            }

                            firstTimeString = false;
                        }

                        answers.Add(new CompanyAnswer()
                        {
                            Id = aId++,
                            IntervieweeId = interviewee.Id,
                            CompanyId = companiesDict[companyScore.CompanyName].Id,
                            IsKnown = companyScore.IsKnown,
                            IsGood = companyScore.IsWanted,
                            IsWanted = companyScore.IsWanted
                        });
                    }
                }
            }

            foreach (var lang in languagesDict.Values)
                context.Languages.Add(lang);
            foreach (var comp in companiesDict.Values)
                context.Companies.Add(comp);
            foreach (var i in interviewees)
                context.Interviewees.Add(i);
            foreach (var answer in answers)
                context.CompanyAnswers.Add(answer);

            context.SaveChanges();
        }
    }
}