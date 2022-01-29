using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using CsvHelper;
using CsvHelper.Configuration;
using Newtonsoft.Json;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Survey2020;
#pragma warning disable CS1591

namespace RndTech.DevRel.App.DAL
{
    public static class DbInitializer
    {
        private static readonly Dictionary<string, Language> Languages = new();
        private static readonly Dictionary<string, MotivationFactor> MotivationFactors = new();
        private static readonly Dictionary<string, CommunitySource> CommunitySources = new();
        private static readonly Dictionary<string, Company> Companies = new();
        private static readonly List<Interviewee> Interviewees = new();
        private static readonly List<CompanyAnswer> Answers = new();
        private static readonly List<IntervieweeLanguage> IntervieweeLanguages = new();
        private static readonly List<IntervieweeMotivationFactor> IntervieweeMotivationFactors = new();
        private static readonly List<IntervieweeCommunitySource> IntervieweeCommunitySources = new();

        public static void Initialize(SurveyDbContext context)
        {
            context.Database.EnsureCreated();
            if (context.Interviewees.Any())
            {
                return;
            }

            Fill2019YearData();
            Fill2020YearData();
            Fill2021YearData();

            context.Languages.AddRange(Languages.Values);
            context.Companies.AddRange(Companies.Values);
            context.Interviewees.AddRange(Interviewees);
            context.CompanyAnswers.AddRange(Answers);
            context.IntervieweeLanguages.AddRange(IntervieweeLanguages);
            context.MotivationFactors.AddRange(MotivationFactors.Values);
            context.IntervieweeMotivationFactors.AddRange(IntervieweeMotivationFactors);
            context.CommunitySources.AddRange(CommunitySources.Values);
            context.IntervieweeCommunitySources.AddRange(IntervieweeCommunitySources);

            context.SaveChanges();
        }

        private static void Fill2020YearData()
        {
            var textAnswers = File.ReadAllText("2020.json");
            var answers = JsonConvert.DeserializeObject<List<SurveyAnswer>>(textAnswers)!;

            foreach (var answer in answers)
            {
                var interviewee = new Interviewee
                {
                    Id = Guid.NewGuid(),
                    Age = answer.AgeQuestion,
                    City = answer.CityQuestion,
                    Education = answer.EducationQuestion == "Высшее" 
                        ? "Высшее, закончил" 
                        : answer.EducationQuestion.StartsWith("Среднее") 
                            ? "Решил не заканчивать высшее" 
                            : answer.EducationQuestion,
                    Profession = answer.ProfessionQuestion,
                    ProfessionLevel = answer.ProfessionLevelQuestion,
                    VisitMeetups = answer.MeetupsQuestion,
                    Year = 2020,
                    IsCommunity = answer.MeetupsQuestion
                };
                Interviewees.Add(interviewee);

                foreach (var propertyInfo in answer.CompaniesQuestion.GetType().GetProperties())
                {
                    AddCompanyAnswer(propertyInfo, answer, interviewee);
                }
                
                if (answer.TechnologiesQuestion != null)
                {
                    foreach (var language in answer.TechnologiesQuestion)
                    {
                        if (!Languages.ContainsKey(language))
                        {
                            var l = new Language {Id = Guid.NewGuid(), Name = language};
                            Languages.Add(l.Name, l);
                        }
                        
                        IntervieweeLanguages.Add(new IntervieweeLanguage
                        {
                            IntervieweeId = interviewee.Id,
                            LanguageId = Languages[language].Id
                        });
                    }
                }
                
                if (answer.MeetupsQuestion && answer.MeetupsSourceQuestion != null)
                {
                    foreach (var ms in answer.MeetupsSourceQuestion)
                    {
                        if (!CommunitySources.ContainsKey(ms))
                        {
                            var l = new CommunitySource {Id = Guid.NewGuid(), Name = ms};
                            CommunitySources.Add(l.Name, l);
                        }
                        
                        IntervieweeCommunitySources.Add(new IntervieweeCommunitySource
                        {
                            IntervieweeId = interviewee.Id,
                            CommunitySourceId = CommunitySources[ms].Id
                        });
                    }
                }

                foreach (var companyCriteria in answer.CompaniesCriteriaQuestion)
                {
                    if (!MotivationFactors.ContainsKey(companyCriteria))
                    {
                        var mf = new MotivationFactor {Id = Guid.NewGuid(), Name = companyCriteria};
                        MotivationFactors.Add(mf.Name, mf);
                    }
                    
                    IntervieweeMotivationFactors.Add(new IntervieweeMotivationFactor
                    {
                        IntervieweeId = interviewee.Id,
                        MotivationFactorId = MotivationFactors[companyCriteria].Id
                    });
                }
            }
        }
        
        private static void AddCompanyAnswer(PropertyInfo propertyInfo,
            SurveyAnswer answer, Interviewee interviewee)
        {
            var companyName =
                propertyInfo.GetCustomAttribute<CompanyNameAttribute>()?.Name
                ?? propertyInfo.GetCustomAttribute<JsonPropertyAttribute>()?.PropertyName
                ?? propertyInfo.Name;
            var propertyValue = (SurveyCompanyAnswer) propertyInfo.GetValue(answer.CompaniesQuestion);
            
            if(propertyValue == null)
                return;
            
            if (!Companies.ContainsKey(companyName))
            {
                var c = new Company {Id = Guid.NewGuid(), Name = companyName};
                Companies.Add(c.Name, c);
            }

            var companyAnswer = new CompanyAnswer
            {
                Id = Guid.NewGuid(),
                IntervieweeId = interviewee.Id,
                CompanyId = Companies[companyName].Id,
                IsKnown = propertyValue.ЗнаюСлышал,
                IsGood = propertyValue.Готоврекомендовать?.Any() ?? false,
                IsWanted = propertyValue.Хочуработать?.Any() ??  false
            };
            Answers.Add(companyAnswer);
        }

        private static void Fill2021YearData()
        {
            using var reader = new StreamReader("2021.csv");
            using var csv = new CsvReader(reader,
                new CsvConfiguration(CultureInfo.InvariantCulture) {BadDataFound = null, Delimiter = ","});

            var companies = new List<string>();
            var isFirstLine = true;
            while (csv.Read())
            {
                if (!isFirstLine)
                {
                    var city = csv.GetField<string>(1);
                    if(string.IsNullOrEmpty(city))
                        city = csv.GetField<string>(2);

                    var ageString = csv.GetField<int>(3);
                    var education = csv.GetField<string>(4);
                    var profession = csv.GetField<string>(5);

                    var languages = new List<string>();
                    for (var i = 7; i <= 34; i++)
                    {
                        var l = csv.GetField<string>(i);
                        if (!string.IsNullOrEmpty(l))
                            languages.Add(l);
                    }

                    var level = csv.GetField<string>(36);
                    var isMeetupVisitor = csv.GetField<string>(37) == "1";
                    var meetupSources = new List<string>();
                    for (int i = 38; i <= 45; i++)
                    {
                        var s = csv.GetField<string>(i);
                        if (!string.IsNullOrEmpty(s))
                            meetupSources.Add(s);
                    }

                    for (int i = 47; i <= 54; i++)
                    {
                        var s = csv.GetField<string>(i);
                        if (!string.IsNullOrEmpty(s))
                            meetupSources.Add(s);
                    }
                    
                    var interviewee = new Interviewee
                    {
                        Id = Guid.NewGuid(),
                        Age = ageString,
                        City = city,
                        Education = education,
                        Profession = profession,
                        ProfessionLevel = level,
                        VisitMeetups = isMeetupVisitor,
                        Year = 2021,
                        
                        IsCommunity = isMeetupVisitor
                    };
                    Interviewees.Add(interviewee);
                    
                    foreach (var language in languages)
                    {
                        if (!Languages.ContainsKey(language))
                        {
                            var l = new Language {Id = Guid.NewGuid(), Name = language};
                            Languages.Add(l.Name, l);
                        }
                        
                        IntervieweeLanguages.Add(new IntervieweeLanguage
                        {
                            IntervieweeId = interviewee.Id,
                            LanguageId = Languages[language].Id
                        });
                    }
                    
                    foreach (var ms in meetupSources)
                    {
                        if (!CommunitySources.ContainsKey(ms))
                        {
                            var l = new CommunitySource {Id = Guid.NewGuid(), Name = ms};
                            CommunitySources.Add(l.Name, l);
                        }
                        
                        IntervieweeCommunitySources.Add(new IntervieweeCommunitySource
                        {
                            IntervieweeId = interviewee.Id,
                            CommunitySourceId = CommunitySources[ms].Id
                        });
                    }
                    
                    for (int i = 57; i <= 145; i++)
                    {
                        var companyItem = csv.GetField<string>(i);
                        var companyAnswer = new CompanyAnswer
                        {
                            Id = Guid.NewGuid(),
                            IntervieweeId = interviewee.Id,
                            CompanyId = Companies[companies[i - 57]].Id,
                            IsKnown = companyItem != "Не знаю",
                            IsGood = companyItem == "Знаю и рекомендую",
                            IsWanted = companyItem == "Знаю и хочу работать"
                        };
                        
                        Answers.Add(companyAnswer);
                    }
                }

                if (isFirstLine)
                {
                    for (int i = 57; i <= 145; i++)
                    {
                        companies.Add(csv.GetField<string>(i));
                        var companyName = csv.GetField<string>(i);
                        
                        if (!Companies.ContainsKey(companyName))
                        {
                            var c = new Company {Id = Guid.NewGuid(), Name = companyName};
                            Companies.Add(c.Name, c);
                        }
                    }
                }
                
                isFirstLine = false;
            }
        }
        
        private static void Fill2019YearData()
        {
            using var reader = new StreamReader("testdata.csv");
            using var csv = new CsvReader(reader,
                new CsvConfiguration(CultureInfo.InvariantCulture) {BadDataFound = null, Delimiter = ","});

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

                    if (!Companies.ContainsKey(companyScore.CompanyName))
                    {
                        var c = new Company {Id = Guid.NewGuid(), Name = companyScore.CompanyName};
                        Companies.Add(c.Name, c);
                    }

                    if (firstTimeString)
                    {
                        foreach (var language in companyScore.ProgrammingLanguages)
                        {
                            if (!Languages.ContainsKey(language))
                            {
                                var l = new Language {Id = Guid.NewGuid(), Name = language};
                                Languages.Add(l.Name, l);
                            }
                        }

                        interviewee = new Interviewee
                        {
                            Id = Guid.NewGuid(),
                            Age = companyScore.Age,
                            City = companyScore.City,
                            Education = companyScore.Education,
                            Profession = companyScore.Profession,
                            ProfessionLevel = companyScore.ExperienceLevel,
                            VisitMeetups = companyScore.IsCommunity,
                            Year = 2019,
                            IsCommunity = companyScore.IsCommunity
                        };
                        Interviewees.Add(interviewee);

                        foreach (var language in companyScore.ProgrammingLanguages)
                        {
                            IntervieweeLanguages.Add(new IntervieweeLanguage
                            {
                                IntervieweeId = interviewee.Id,
                                LanguageId = Languages[language].Id
                            });
                        }
                        
                        if (companyScore.IsCommunity && companyScore.CommunitySource != null)
                        {
                            foreach (var ms in companyScore.CommunitySource)
                            {
                                if (!CommunitySources.ContainsKey(ms))
                                {
                                    var l = new CommunitySource {Id = Guid.NewGuid(), Name = ms};
                                    CommunitySources.Add(l.Name, l);
                                }
                        
                                IntervieweeCommunitySources.Add(new IntervieweeCommunitySource
                                {
                                    IntervieweeId = interviewee.Id,
                                    CommunitySourceId = CommunitySources[ms].Id
                                });
                            }
                        }

                        firstTimeString = false;
                    }

                    Answers.Add(new CompanyAnswer
                    {
                        Id = Guid.NewGuid(),
                        IntervieweeId = interviewee.Id,
                        CompanyId = Companies[companyScore.CompanyName].Id,
                        IsKnown = companyScore.IsKnown,
                        IsGood = companyScore.IsWanted,
                        IsWanted = companyScore.IsWanted
                    });
                }
            }
        }
    }
}