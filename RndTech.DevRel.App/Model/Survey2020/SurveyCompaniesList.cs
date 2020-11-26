using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace RndTech.DevRel.App.Model.Survey2020
{
    public class SurveyCompaniesList
    {
        [JsonProperty("2UP")]
        public SurveyCompanyAnswer Company2UP { get; set; } 
        [JsonProperty("42.works")]
        public SurveyCompanyAnswer Company42Works { get; set; } 
        public SurveyCompanyAnswer A2SEVEN { get; set; } 
        public SurveyCompanyAnswer Accenture { get; set; } 
        public SurveyCompanyAnswer Afterlogic { get; set; } 
        [JsonProperty("AppForge Inc")]
        public SurveyCompanyAnswer AppForgeInc { get; set; } 
        public SurveyCompanyAnswer Apsis { get; set; } 
        public SurveyCompanyAnswer Arcadia { get; set; } 
        public SurveyCompanyAnswer Auriga { get; set; } 
        public SurveyCompanyAnswer BETCITY { get; set; } 
        public SurveyCompanyAnswer Cboss { get; set; } 
        public SurveyCompanyAnswer ChilliCode { get; set; } 
        public SurveyCompanyAnswer CloudLinux { get; set; } 
        [JsonProperty("Comepay (Кампэй)")]
        public SurveyCompanyAnswer Comepay { get; set; } 
        public SurveyCompanyAnswer Convermax { get; set; } 
        public SurveyCompanyAnswer CVisionLab { get; set; }
        [JsonProperty("DATUM Group")]
        public SurveyCompanyAnswer DATUMGroup { get; set; } 
        public SurveyCompanyAnswer DBI { get; set; } 
        [JsonProperty("DDoS Guard")]
        public SurveyCompanyAnswer DDoSGuard { get; set; } 
        public SurveyCompanyAnswer Devexperts { get; set; } 
        [JsonProperty("Digital Skynet")]
        public SurveyCompanyAnswer DigitalSkynet { get; set; } 
        public SurveyCompanyAnswer Distillery { get; set; } 
        public SurveyCompanyAnswer DonRiver { get; set; } 
        public SurveyCompanyAnswer Donteco { get; set; } 
        public SurveyCompanyAnswer Dunice { get; set; } 
        public SurveyCompanyAnswer Elonsoft { get; set; } 
        public SurveyCompanyAnswer eSignal { get; set; } 
        [JsonProperty("Exceed Team")]
        public SurveyCompanyAnswer ExceedTeam { get; set; } 
        public SurveyCompanyAnswer FastReport { get; set; } 
        public SurveyCompanyAnswer Finastra { get; set; } 
        public SurveyCompanyAnswer Firecode { get; set; } 
        public SurveyCompanyAnswer Fusion { get; set; } 
        [JsonProperty("Game Insight")]
        public SurveyCompanyAnswer GameInsight { get; set; } 
        public SurveyCompanyAnswer GameNuts { get; set; } 
        [JsonProperty("Grapheme (Графема)")]
        public SurveyCompanyAnswer Grapheme { get; set; } 
        public SurveyCompanyAnswer GraphGrail { get; set; } 
        [JsonProperty("GrowApp Solutions")]
        public SurveyCompanyAnswer GrowAppSolutions { get; set; } 
        public SurveyCompanyAnswer Hotger { get; set; } 
        public SurveyCompanyAnswer HttpLab { get; set; } 
        public SurveyCompanyAnswer InCountry { get; set; } 
        public SurveyCompanyAnswer INOSTUDIO { get; set; } 
        [JsonProperty("Intellectika (Интеллектика)")]
        public SurveyCompanyAnswer Intellectika { get; set; } 
        [JsonProperty("INVO Group")]
        public SurveyCompanyAnswer INVOGroup { get; set; } 
        [JsonProperty("IT-Delta")]
        public SurveyCompanyAnswer ITDelta { get; set; } 
        [JsonProperty("IT Premium")]
        public SurveyCompanyAnswer ITPremium { get; set; } 
        public SurveyCompanyAnswer KPMG { get; set; } 
        public SurveyCompanyAnswer LetMeCode { get; set; } 
        [JsonProperty("Leviossa IT")]
        public SurveyCompanyAnswer LeviossaIT { get; set; } 
        [JsonProperty("M-13")]
        public SurveyCompanyAnswer M13 { get; set; } 
        public SurveyCompanyAnswer MentalStack { get; set; } 
        public SurveyCompanyAnswer Motorsport { get; set; } 
        public SurveyCompanyAnswer MultiCharts { get; set; } 
        public SurveyCompanyAnswer Newizze { get; set; } 
        public SurveyCompanyAnswer Nindeco { get; set; } 
        public SurveyCompanyAnswer NSSoft { get; set; } 
        public SurveyCompanyAnswer Oggetto { get; set; } 
        [JsonProperty("Orange Code")]
        public SurveyCompanyAnswer OrangeCode { get; set; } 
        [JsonProperty("Panda digital")]
        public SurveyCompanyAnswer Pandadigital { get; set; } 
        public SurveyCompanyAnswer Playrix { get; set; } 
        public SurveyCompanyAnswer ProgForce { get; set; } 
        [JsonProperty("Quirco (Квирко)")]
        public SurveyCompanyAnswer Quirco { get; set; } 
        [JsonProperty("Rnd soft (+Winvestor)")]
        public SurveyCompanyAnswer RndsoftWinvestor { get; set; } 
        public SurveyCompanyAnswer Reksoft { get; set; } 
        public SurveyCompanyAnswer Roonyx { get; set; } 
        public SurveyCompanyAnswer Sebbia { get; set; } 
        public SurveyCompanyAnswer SimpleCode { get; set; } 
        [JsonProperty("SoftGrad Solutions")]
        public SurveyCompanyAnswer SoftGradSolutions { get; set; } 
        [JsonProperty("Solar Games")]
        public SurveyCompanyAnswer SolarGames { get; set; } 
        public SurveyCompanyAnswer Statzilla { get; set; } 
        [JsonProperty("Storytelling Software")]
        public SurveyCompanyAnswer StorytellingSoftware { get; set; } 
        public SurveyCompanyAnswer Tele2 { get; set; } 
        public SurveyCompanyAnswer TerraLink { get; set; } 
        public SurveyCompanyAnswer TradingView { get; set; } 
        public SurveyCompanyAnswer uKit { get; set; } 
        [JsonProperty("Umbrella IT")]
        public SurveyCompanyAnswer UmbrellaIT { get; set; } 
        public SurveyCompanyAnswer Uniquite { get; set; } 
        public SurveyCompanyAnswer Usetech { get; set; } 
        public SurveyCompanyAnswer VIAcode { get; set; } 
        public SurveyCompanyAnswer WebAnt { get; set; } 
        public SurveyCompanyAnswer WebSailors { get; set; } 
        [JsonProperty("WIS Software")]
        public SurveyCompanyAnswer WISSoftware { get; set; } 
        [JsonProperty("Work Solutions")]
        public SurveyCompanyAnswer WorkSolutions { get; set; } 
        [JsonProperty("Первый Бит")]
        public SurveyCompanyAnswer ПервыйБит { get; set; } 
        public SurveyCompanyAnswer Zuzex { get; set; } 
        public SurveyCompanyAnswer Вебпрактик { get; set; } 
        public SurveyCompanyAnswer Веброст { get; set; } 
        public SurveyCompanyAnswer Вебстрой { get; set; }
        [JsonProperty("Везёт Всем")]
        public SurveyCompanyAnswer ВезётВсем { get; set; } 
        public SurveyCompanyAnswer ВинтаСофт { get; set; } 
        public SurveyCompanyAnswer ГЛОНАССсофт { get; set; } 
        [JsonProperty("Глория Джинс")]
        public SurveyCompanyAnswer ГлорияДжинс { get; set; } 
        public SurveyCompanyAnswer Гэндальф { get; set; } 
        [JsonProperty("«Иммельман» — бюро интернет-проектов")]
        public SurveyCompanyAnswer ИммельманБюроинтернетПроектов { get; set; } 
        [JsonProperty("Интернет-Фрегат")]
        public SurveyCompanyAnswer ИнтернетФрегат { get; set; } 
        public SurveyCompanyAnswer Киноплан { get; set; } 
        public SurveyCompanyAnswer Контур { get; set; } 
        [JsonProperty("Лайт Мэп")]
        public SurveyCompanyAnswer ЛайтМэп { get; set; } 
        public SurveyCompanyAnswer Мегафон { get; set; } 
        public SurveyCompanyAnswer Орбитсофт { get; set; } 
        [JsonProperty("Программные технологии (СофТех)")]
        public SurveyCompanyAnswer ПрограммныетехнологииСофТех { get; set; } 
        public SurveyCompanyAnswer ПрофИТ { get; set; } 
        public SurveyCompanyAnswer РаДон { get; set; } 
        public SurveyCompanyAnswer Сбер { get; set; } 
        [JsonProperty("Спецвуз-автоматика")]
        public SurveyCompanyAnswer СпецвузАвтоматика { get; set; } 
        [JsonProperty("Студия Олега Чулакова")]
        public SurveyCompanyAnswer СтудияОлегаЧулакова { get; set; } 
        public SurveyCompanyAnswer Тинькофф { get; set; } 
        public SurveyCompanyAnswer ЦентрИнвест { get; set; } 
        [JsonProperty("Югпром-автоматизация")]
        public SurveyCompanyAnswer ЮгпромАвтоматизация { get; set; } 
        [JsonProperty("Южная софтверная компания (ЮСК)")]
        public SurveyCompanyAnswer ЮжнаясофтвернаякомпанияЮСК { get; set; }

        public IEnumerable<SurveyAnswer> All()
        {
            return GetType().GetProperties().Select(p => p.GetValue(this)).OfType<SurveyAnswer>();
        }
    }
}