using System.Collections.Generic;
using Newtonsoft.Json;

namespace RndTech.DevRel.App.Model.Survey2020
{
    public class SurveyAnswer
    {
        public string CityQuestion { get; set; } 
        public int AgeQuestion { get; set; } 
        public string EducationQuestion { get; set; } 
        public string ProfessionQuestion { get; set; } 
        public List<string> TechnologiesQuestion { get; set; } 
        public string ProfessionLevelQuestion { get; set; } 
        public bool MeetupsQuestion { get; set; } 
        public List<string> MeetupsSourceQuestion { get; set; } 
        public List<string> CompaniesCriteriaQuestion { get; set; } 
        public string CompaniesLeadersQuestion { get; set; } 
        public SurveyCompaniesList CompaniesQuestion { get; set; } 
        public string EmailQuestion { get; set; } 
        [JsonProperty("MeetupsSourceQuestion-Comment")]
        public string MeetupsSourceQuestionComment { get; set; } 
    }
}