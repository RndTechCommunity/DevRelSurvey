using System.Collections.Generic;
using Newtonsoft.Json;

namespace RndTech.DevRel.App.Model.Survey2020
{
    public class SurveyCompanyAnswer
    {
        [JsonProperty("Знаю / слышал")] 
        public bool ЗнаюСлышал { get; set; }
        
        [JsonProperty("Готов рекомендовать")]
        public List<string> Готоврекомендовать { get; set; }
        
        [JsonProperty("Хочу работать")]
        public List<string> Хочуработать { get; set; }
    }
}