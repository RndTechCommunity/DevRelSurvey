using CsvHelper.Configuration.Attributes;

namespace RndTech.DevRel.Importer._2022;

public class AnswerFileModel
{
	[Index(0)]
	public string? City { get; set; }
	
	[Index(1)]
	public string CityNotInList { get; set; }
	
	[Index(2)]
	public string AgeString { get; set; }
	public int? Age => int.TryParse(AgeString, out var age) ? age : null;
	
	[Index(3)]
	public string Education { get; set; }

	[Index(4)]
	public string Profession { get; set; }

	[Index(5)]
	public string ProgrammingLanguagesRawData { get; set; }
	
	[Index(6)]
	public string ProgrammingLanguagesNotInList { get; set; }
	
	public IEnumerable<string> GetProgrammingLanguages()
	{
		// Не пишу код
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/gkpvvptfLcU4sWj35WMuqOo6OXzgcL6fIEan.jpg"))
			yield break;

		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/q6WWeDiUTB0Oio4RLQ72FcWdskNsOEF7GxrT.jpeg"))
			yield return "SQL";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/jZAQqM3vRzBu613NgVQU5QdPItPT5IiN6Siq.png"))
			yield return "Python";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/f4kFkwDWsEy9o6sEVvDxO9KcUkiNonCx648i.png"))
			yield return "JavaScript";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/9Z90bYGvTsYOQ0Pr0e20WE566yTQG96PtLrM.png"))
			yield return "C#";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/M1tahmlMbv8vMh33sZY62llnd4OWIhLODVoe.min.png"))
			yield return "TypeScript";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/5ay4Gb2iyMCP7bpBXs1TBPq3ziRNADzanDqO.jpeg"))
			yield return "C / C++";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/FPWVRmzVWXks3Y2WKXLK2ltkUvq5R4BB2gvt.jpeg"))
			yield return "Java";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/mmo5vpWuhMw8PGqTt7gcKhAoq8jmtgmjySgJ.png"))
			yield return "PHP";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/dR7pfY5BMNrPZFLzVOcpmcnsDN6JduNW8dcw.png"))
			yield return "Kotlin";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/S1MiqamQVzPP76aiOAsKeMisBu2SoWkj0CrT.png"))
			yield return "Go";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/cdtyryBpLBjQkvGpUreaHDalkOfIdLmpehEX.png"))
			yield return "1С";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/7vklJd0W8R6JeHJpNQzeL7ClfoQvfBklAPia.png"))
			yield return "Swift";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/aJN6e3I8eDlyfiYeLhz7wkqJlqGOG5JZcYCn.png"))
			yield return "Ruby";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/KS56anMzMORkqnjYWu3FErZbXapmzB8opHWa.png"))
			yield return "Scala";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/AdHhUq7E2AJqQDe7x48mMLMKq3bqBvtyyvCw.jpeg"))
			yield return "Groovy";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/5k2zVTIAAC7kPB1II16tnzvV45Hbujotn3lu.png"))
			yield return "Perl";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/V3qGTRsGN6EBqmALkrACaW1vj3LvcBB3pkMO.jpeg"))
			yield return "SAP";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/nqOLtO40dIaFG3E2n3JOsitSNl2hBaV04T0d.png"))
			yield return "Objective-C";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/NkritGFQQSqAXGowfyaN9oT0EGe9Q6MRhuXa.png"))
			yield return "Lua";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/XL3ModOqrxHQzHds9tPdXg3DI0kvocbpUGbB.png"))
			yield return "Dart";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/wJhyKMtEQLDKydGC7U7XBENM0fNCYIaUmKX8.png"))
			yield return "Assembler";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/cDHoMgrMos60I8rUagYQLcbjSPTtR2QQLqpZ.png"))
			yield return "R";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/Ly7rmaEhzWawn1NltuAavjuQHCI43eYvxjfL.png"))
			yield return "Erlang";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/HpqEjzapkJUZ5X6Na5CrOVR4y9gNbG7wTAVo.png"))
			yield return "Elixir";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/eB40yc5tqJc9sKhPKDojZkHf5hvYvA6Rp3uk.png"))
			yield return "Rust";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/Z9hg3MAx53vJxJW3n9B2cIYK1zcAXfG0L8oQ.jpeg"))
			yield return "Haskell";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/0eyxvkPhrrgte7j3cN6B2uKZC0fteBxrlAvO.png"))
			yield return "Elm";
		if (ProgrammingLanguagesRawData.Contains("https://app.webask.io/wa-prod/new_quiz_versions/SvbD6rXXnXIdZLRJiCtTp2fkWmNdM3BI7uIR.png"))
			yield return "F#";
		
		if(ProgrammingLanguagesNotInList.Contains("Delphi"))
			yield return "Delphi";
	}
	
	[Index(7)]
	public string ProfessionLevel { get; set; }

	[Index(8)]
	public string VisitMeetupsString { get; set; }
	public bool VisitMeetups => VisitMeetupsString != "Нет";
	
	[Index(9)]
	public string MeetupSourcesRawData { get; set; }

	public string[] GetMeetupSources()
	{
		return MeetupSourcesRawData
			.Split('|', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
	}
	
	[Index(10)]
	public string MeetupProposals { get; set; }
	
	[Index(11)]
	public string BestRostovCompanies { get; set; }
	
	[Index(12)]
	public string Аркадия { get; set; }
	
	[Index(13)]
	public string Вебпрактик { get; set; }
	
	[Index(14)]
	public string Контур { get; set; }
	
	[Index(15)]
	public string Оджетто { get; set; }
	
	[Index(16)]
	public string Почтатех { get; set; }
	
	[Index(17)]
	public string Спецвузавтоматика { get; set; }
	
	[Index(18)]
	public string Тинькофф { get; set; }
	
	[Index(19)]
	public string ЦентрИнвест { get; set; }
	
	[Index(20)]
	public string A2SEVEN { get; set; }
	
	[Index(21)]
	public string Afterlogic { get; set; }
	
	[Index(22)]
	public string Auriga { get; set; }
	
	[Index(23)]
	public string Axenix { get; set; }
	
	[Index(24)]
	public string Devexperts { get; set; }
	
	[Index(25)]
	public string Distillery { get; set; }
	
	[Index(26)]
	public string FusionTech { get; set; }
	
	[Index(27)]
	public string IBSDunice { get; set; }
	
	[Index(28)]
	public string INOSTUDIO { get; set; }
	
	[Index(29)]
	public string Intellectika { get; set; }
	
	[Index(30)]
	public string Intspirit { get; set; }
	
	[Index(31)]
	public string JusticeIT { get; set; }
	
	[Index(32)]
	public string Reksoft { get; set; }
	
	[Index(33)]
	public string RNDSOFT { get; set; }
	
	[Index(34)]
	public string Usetech { get; set; }
	
	[Index(35)]
	public string WebAnt { get; set; }
	
	[Index(36)]
	public string TwoUP { get; set; }
	
	[Index(37)]
	public string Быстрыеотчеты { get; set; }
	
	[Index(38)]
	public string Гэндальф { get; set; }
	
	[Index(39)]
	public string ИнтернетФрегат { get; set; }
	
	[Index(40)]
	public string ИТРУМ { get; set; }
	
	[Index(41)]
	public string Киноплан { get; set; }
	
	[Index(42)]
	public string Медотрейд { get; set; }
	
	[Index(43)]
	public string Небо { get; set; }
	
	[Index(44)]
	public string Программныетехнологии { get; set; }
	
	[Index(45)]
	public string ПрофИТ { get; set; }
	
	[Index(46)]
	public string Сбер { get; set; }
	
	[Index(47)]
	public string СтудияОлегаЧулакова { get; set; }
	
	[Index(48)]
	public string Aston { get; set; }
	
	[Index(49)]
	public string BETCITY { get; set; }
	
	[Index(50)]
	public string ChilliCode { get; set; }
	
	[Index(51)]
	public string CVisionLab { get; set; }
	
	[Index(52)]
	public string DATUM { get; set; }
	
	[Index(53)]
	public string DBI { get; set; }
	
	[Index(54)]
	public string DDoSGuard { get; set; }
	
	[Index(55)]
	public string Donteco { get; set; }
	
	[Index(56)]
	public string Elonsoft { get; set; }
	
	[Index(57)]
	public string Firecode { get; set; }
	
	[Index(58)]
	public string GrowAppSolutions { get; set; }
	
	[Index(59)]
	public string Hotger { get; set; }
	
	[Index(60)]
	public string HttpLab { get; set; }
	
	[Index(61)]
	public string ITDelta { get; set; }
	
	[Index(62)]
	public string ITP { get; set; }
	
	[Index(63)]
	public string LeviossaIT{ get; set; }
	
	[Index(64)]
	public string Mobyte { get; set; }
	
	[Index(65)]
	public string OrbitSoft { get; set; }
	
	[Index(66)]
	public string PandaDigital { get; set; }
	
	[Index(67)]
	public string Sebbia { get; set; }
	
	[Index(68)]
	public string Shellpea { get; set; }
	
	[Index(69)]
	public string SimpleCode { get; set; }
	
	[Index(70)]
	public string Statzilla { get; set; }
	
	[Index(71)]
	public string StorytellingSoftware { get; set; }
	
	[Index(72)]
	public string Tele2 { get; set; }
	
	[Index(73)]
	public string TradingView { get; set; }
	
	[Index(74)]
	public string uKit { get; set; }
	
	[Index(75)]
	public string UmbrellaIT { get; set; }
	
	[Index(76)]
	public string VisionSystems { get; set; }
	
	[Index(77)]
	public string WebSailors { get; set; }
	
	[Index(78)]
	public string Winvestor { get; set; }
	
	[Index(79)]
	public string WISSoftware { get; set; }
	
	[Index(80)]
	public string WorkSolutions { get; set; }
	
	[Index(81)]
	public string Zuzex { get; set; }

	public IEnumerable<CompanyAnswerFileModel> GetCompanyAnswerFileModels()
	{
		if (!string.IsNullOrWhiteSpace(Zuzex))
			yield return GetCompanyAnswerFileModel(Zuzex, "Zuzex");
		if (!string.IsNullOrWhiteSpace(WorkSolutions))
			yield return GetCompanyAnswerFileModel(WorkSolutions, "Work Solutions");
		if (!string.IsNullOrWhiteSpace(WISSoftware))
			yield return GetCompanyAnswerFileModel(WISSoftware, "WIS Software");
		if (!string.IsNullOrWhiteSpace(Winvestor))
			yield return GetCompanyAnswerFileModel(Winvestor, "Винвестор");
		if (!string.IsNullOrWhiteSpace(WebSailors))
			yield return GetCompanyAnswerFileModel(WebSailors, "WebSailors");
		if (!string.IsNullOrWhiteSpace(VisionSystems))
			yield return GetCompanyAnswerFileModel(VisionSystems, "VisionSystems");
		if (!string.IsNullOrWhiteSpace(UmbrellaIT))
			yield return GetCompanyAnswerFileModel(UmbrellaIT, "Umbrella IT");
		if (!string.IsNullOrWhiteSpace(uKit))
			yield return GetCompanyAnswerFileModel(uKit, "uKit");
		if (!string.IsNullOrWhiteSpace(TradingView))
			yield return GetCompanyAnswerFileModel(TradingView, "TradingView");
		if (!string.IsNullOrWhiteSpace(Tele2))
			yield return GetCompanyAnswerFileModel(Tele2, "Tele2");
		if (!string.IsNullOrWhiteSpace(StorytellingSoftware))
			yield return GetCompanyAnswerFileModel(StorytellingSoftware, "Storytelling Software");
		if (!string.IsNullOrWhiteSpace(Statzilla))
			yield return GetCompanyAnswerFileModel(Statzilla, "Statzilla");
		if (!string.IsNullOrWhiteSpace(SimpleCode))
			yield return GetCompanyAnswerFileModel(SimpleCode, "SimpleCode");
		if (!string.IsNullOrWhiteSpace(Shellpea))
			yield return GetCompanyAnswerFileModel(Shellpea, "Shellpea");
		if (!string.IsNullOrWhiteSpace(Sebbia))
			yield return GetCompanyAnswerFileModel(Sebbia, "Sebbia");
		if (!string.IsNullOrWhiteSpace(PandaDigital))
			yield return GetCompanyAnswerFileModel(PandaDigital, "Panda digital");
		if (!string.IsNullOrWhiteSpace(OrbitSoft))
			yield return GetCompanyAnswerFileModel(OrbitSoft, "Орбитсофт");
		if (!string.IsNullOrWhiteSpace(Mobyte))
			yield return GetCompanyAnswerFileModel(Mobyte, "Mobyte");
		if (!string.IsNullOrWhiteSpace(LeviossaIT))
			yield return GetCompanyAnswerFileModel(LeviossaIT, "Leviossa IT");
		if (!string.IsNullOrWhiteSpace(ITP))
			yield return GetCompanyAnswerFileModel(ITP, "ITP (ex IT Premium)");
		if (!string.IsNullOrWhiteSpace(ITDelta))
			yield return GetCompanyAnswerFileModel(ITDelta, "IT-Delta");
		if (!string.IsNullOrWhiteSpace(HttpLab))
			yield return GetCompanyAnswerFileModel(HttpLab, "HttpLab");
		if (!string.IsNullOrWhiteSpace(Hotger))
			yield return GetCompanyAnswerFileModel(Hotger, "Hotger");
		if (!string.IsNullOrWhiteSpace(GrowAppSolutions))
			yield return GetCompanyAnswerFileModel(GrowAppSolutions, "GrowApp Solutions");
		if (!string.IsNullOrWhiteSpace(Firecode))
			yield return GetCompanyAnswerFileModel(Firecode, "Firecode");
		if (!string.IsNullOrWhiteSpace(Elonsoft))
			yield return GetCompanyAnswerFileModel(Elonsoft, "Elonsoft");
		if (!string.IsNullOrWhiteSpace(Donteco))
			yield return GetCompanyAnswerFileModel(Donteco, "Donteco");
		if (!string.IsNullOrWhiteSpace(DDoSGuard))
			yield return GetCompanyAnswerFileModel(DDoSGuard, "DDoS Guard");
		if (!string.IsNullOrWhiteSpace(DBI))
			yield return GetCompanyAnswerFileModel(DBI, "DBI");
		if (!string.IsNullOrWhiteSpace(DATUM))
			yield return GetCompanyAnswerFileModel(DATUM, "DATUM");
		if (!string.IsNullOrWhiteSpace(CVisionLab))
			yield return GetCompanyAnswerFileModel(CVisionLab, "CVisionLab");
		if (!string.IsNullOrWhiteSpace(ChilliCode))
			yield return GetCompanyAnswerFileModel(ChilliCode, "ChilliCode");
		if (!string.IsNullOrWhiteSpace(BETCITY))
			yield return GetCompanyAnswerFileModel(BETCITY, "BETCITY");
		if (!string.IsNullOrWhiteSpace(Aston))
			yield return GetCompanyAnswerFileModel(Aston, "Aston (ex Andersen)");
		if (!string.IsNullOrWhiteSpace(СтудияОлегаЧулакова))
			yield return GetCompanyAnswerFileModel(СтудияОлегаЧулакова, "Студия Олега Чулакова");
		if (!string.IsNullOrWhiteSpace(Сбер))
			yield return GetCompanyAnswerFileModel(Сбер, "Сбер");
		if (!string.IsNullOrWhiteSpace(ПрофИТ))
			yield return GetCompanyAnswerFileModel(ПрофИТ, "ПрофИТ");
		if (!string.IsNullOrWhiteSpace(Программныетехнологии))
			yield return GetCompanyAnswerFileModel(Программныетехнологии, "Программные технологии");
		if (!string.IsNullOrWhiteSpace(Небо))
			yield return GetCompanyAnswerFileModel(Небо, "НЕБО");
		if (!string.IsNullOrWhiteSpace(Медотрейд))
			yield return GetCompanyAnswerFileModel(Медотрейд, "Медотрейд");
		if (!string.IsNullOrWhiteSpace(Киноплан))
			yield return GetCompanyAnswerFileModel(Киноплан, "Киноплан");
		if (!string.IsNullOrWhiteSpace(ИТРУМ))
			yield return GetCompanyAnswerFileModel(ИТРУМ, "ИТРУМ (ex Exceed Team)");
		if (!string.IsNullOrWhiteSpace(ИнтернетФрегат))
			yield return GetCompanyAnswerFileModel(ИнтернетФрегат, "Интернет-Фрегат");
		if (!string.IsNullOrWhiteSpace(Гэндальф))
			yield return GetCompanyAnswerFileModel(Гэндальф, "Гэндальф");
		if (!string.IsNullOrWhiteSpace(Быстрыеотчеты))
			yield return GetCompanyAnswerFileModel(Быстрыеотчеты, "Быстрые отчеты (ex FastReport)");
		if (!string.IsNullOrWhiteSpace(TwoUP))
			yield return GetCompanyAnswerFileModel(TwoUP, "2UP");
		if (!string.IsNullOrWhiteSpace(WebAnt))
			yield return GetCompanyAnswerFileModel(WebAnt, "WebAnt");
		if (!string.IsNullOrWhiteSpace(Usetech))
			yield return GetCompanyAnswerFileModel(Usetech, "Usetech");
		if (!string.IsNullOrWhiteSpace(RNDSOFT))
			yield return GetCompanyAnswerFileModel(RNDSOFT, "РНДСОФТ");
		if (!string.IsNullOrWhiteSpace(Reksoft))
			yield return GetCompanyAnswerFileModel(Reksoft, "Reksoft");
		if (!string.IsNullOrWhiteSpace(JusticeIT))
			yield return GetCompanyAnswerFileModel(JusticeIT, "Justice IT");
		if (!string.IsNullOrWhiteSpace(Intspirit))
			yield return GetCompanyAnswerFileModel(Intspirit, "IntSpirit");
		if (!string.IsNullOrWhiteSpace(Intellectika))
			yield return GetCompanyAnswerFileModel(Intellectika, "Intellectika (Интеллектика)");
		if (!string.IsNullOrWhiteSpace(INOSTUDIO))
			yield return GetCompanyAnswerFileModel(INOSTUDIO, "INOSTUDIO");
		if (!string.IsNullOrWhiteSpace(IBSDunice))
			yield return GetCompanyAnswerFileModel(IBSDunice, "IBS Dunice");
		if (!string.IsNullOrWhiteSpace(FusionTech))
			yield return GetCompanyAnswerFileModel(FusionTech, "Fusion Tech");
		if (!string.IsNullOrWhiteSpace(Distillery))
			yield return GetCompanyAnswerFileModel(Distillery, "Distillery");
		if (!string.IsNullOrWhiteSpace(Devexperts))
			yield return GetCompanyAnswerFileModel(Devexperts, "Devexperts");
		if (!string.IsNullOrWhiteSpace(Axenix))
			yield return GetCompanyAnswerFileModel(Axenix, "Axenix (ex Accenture)");
		if (!string.IsNullOrWhiteSpace(Auriga))
			yield return GetCompanyAnswerFileModel(Auriga, "Auriga");
		if (!string.IsNullOrWhiteSpace(Afterlogic))
			yield return GetCompanyAnswerFileModel(Afterlogic, "Afterlogic");
		if (!string.IsNullOrWhiteSpace(A2SEVEN))
			yield return GetCompanyAnswerFileModel(A2SEVEN, "A2SEVEN");
		if (!string.IsNullOrWhiteSpace(ЦентрИнвест))
			yield return GetCompanyAnswerFileModel(ЦентрИнвест, "Центр-инвест");
		if (!string.IsNullOrWhiteSpace(Тинькофф))
			yield return GetCompanyAnswerFileModel(Тинькофф, "Тинькофф");
		if (!string.IsNullOrWhiteSpace(Спецвузавтоматика))
			yield return GetCompanyAnswerFileModel(Спецвузавтоматика, "НИИ \"Спецвузавтоматика\"");
		if (!string.IsNullOrWhiteSpace(Почтатех))
			yield return GetCompanyAnswerFileModel(Почтатех, "Почтатех");
		if (!string.IsNullOrWhiteSpace(Оджетто))
			yield return GetCompanyAnswerFileModel(Оджетто, "Oggetto");
		if (!string.IsNullOrWhiteSpace(Контур))
			yield return GetCompanyAnswerFileModel(Контур, "Контур");
		if (!string.IsNullOrWhiteSpace(Вебпрактик))
			yield return GetCompanyAnswerFileModel(Вебпрактик, "Вебпрактик");
		if (!string.IsNullOrWhiteSpace(Аркадия))
			yield return GetCompanyAnswerFileModel(Аркадия, "Аркадия");
	}

	private CompanyAnswerFileModel GetCompanyAnswerFileModel(string answer, string companyName) =>
		new(companyName,
			!answer.Contains("Не знаю"),
			answer.Contains("Знаю и рекомендую"),
			answer.Contains("Знаю и хочу работать"));

	[Index(82)]
	public string BestRussianCompanies { get; set; }
	
	[Index(83)]
	public string WorstRostovCompanies { get; set; }
	
	[Index(84)]
	public string Email { get; set; }
	
	[Index(85)]
	public DateTime FinishDate { get; set; }
	
	[Index(86)]
	public string IpAddress { get; set; }
	
	[Index(87)]
	public string Browser { get; set; }
	
	[Index(88)]
	public string UserAgent { get; set; }
}
