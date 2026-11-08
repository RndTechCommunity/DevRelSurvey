using System.Collections.ObjectModel;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Implementation;
using RndTech.DevRel.App.Implementation.QueryHandlers;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;
using Xunit;

namespace RndTech.DevRel.App.Tests;

public class AudienceMatrixTests
{
	private const string A = "Компания \"А\", 100%";
	private const string Combined = "JavaScript / TypeScript";
	private static readonly UserFilter All = new([], [], [], [], [], [], null, 0);
	private static AudienceMatrixRequest Request(string group = "languages", string?[]? values = null) =>
		new(2022, All, group, values);
	private static MemoryDistributedCache Cache() => new(Options.Create(new MemoryDistributedCacheOptions()));
	private static GetAudienceMatrixQueryHandler Handler(Provider? provider = null) => new(provider ?? new Provider(), Cache());

	[Fact]
	public async Task ColumnsIntersectTheBaseAndKeepCompanyDenominators()
	{
		var response = await Handler().Handle(Request(values: ["Python", "JavaScript", "TypeScript", Combined]) with
		{
			Filter = All with { Languages = ["JavaScript", "TypeScript"], Year = 2019 }
		}, default);
		Assert.Equal(3, response.BaseRespondentCount);
		Assert.Equal([2, 2, 2, 1], response.Columns.Select(c => c.RespondentCount));
		Assert.Equal(new CompanyModel(A, 2022, 1, 1d / 3, 1d / 3, 3, 1, 1, 3, .0441), response.BaseCompanies[0]);
		Assert.Equal(new CompanyModel("AB", 2022, .5, 0, 0, 1, 0, 0, 2, .0441), response.BaseCompanies[1]);
		Assert.Equal(new CompanyModel(A, 2022, 1, .5, .5, 2, 1, 1, 2, .0441), response.Columns[0].Companies[0]);
		Assert.DoesNotContain(response.BaseCompanies, c => c.Name == "Только 2021");
		Assert.Contains("Только 2021", response.CompanyNames);
		Assert.Equal(response.CompanyNames.Order(StringComparer.Ordinal), response.CompanyNames);
		Assert.DoesNotContain(response.AvailableValues, v => v.Value == Combined);
		var conflict = await Handler().Handle(Request("professions", ["Frontend"]) with
		{
			Filter = All with { Professions = ["Backend"] }
		}, default);
		Assert.Equal(2, conflict.BaseRespondentCount);
		Assert.Equal(0, conflict.Columns[0].RespondentCount);
		Assert.Empty(conflict.Columns[0].Companies);
	}

	[Theory]
	[InlineData("professions", "Backend", 2)]
	[InlineData("languages", "Python", 3)]
	[InlineData("ages", "60", 1)]
	[InlineData("cities", "A B", 1)]
	[InlineData("educations", "Высшее", 4)]
	[InlineData("experiences", null, 1)]
	[InlineData("experiences", "", 1)]
	[InlineData("isCommunity", "true", 2)]
	[InlineData("communitySources", "Митапы", 2)]
	public async Task AllDimensionsReturnObservedValuesAndExactCounts(string group, string? value, int count)
	{
		var response = await Handler().Handle(Request(group, [value, value]), default);
		var column = Assert.Single(response.Columns);
		Assert.Equal(count, column.RespondentCount);
		Assert.Contains(response.AvailableValues, v => v.Value == value && v.RespondentCount == count);
		Assert.Equal(value is null ? "Не указан" : value == "" ? "Пустое значение" :
			group == "ages" ? "60–64 года" : group == "isCommunity" ? "Да" : value, column.Label);
		Assert.All(column.Companies, c => Assert.Equal(2022, c.Year));
	}

	[Fact]
	public async Task HistoricalLanguagesAndOverlappingSourcesCountEachPersonOnce()
	{
		var handler = Handler();
		var old = await handler.Handle(Request(values: ["JavaScript", "TypeScript"]) with { Year = 2019 }, default);
		Assert.Equal(1, old.BaseRespondentCount);
		Assert.All(old.Columns, c => Assert.Equal(1, c.RespondentCount));
		Assert.Equal(old.Columns[0].Companies, old.Columns[1].Companies);
		Assert.Equal(new CompanyModel(A, 2019, 1, 1, 1, 1, 1, 1, 1, .0441), old.BaseCompanies[0]);
		var sources = await handler.Handle(Request("communitySources", ["Telegram", "Митапы"]), default);
		Assert.Equal([2, 2], sources.Columns.Select(c => c.RespondentCount));
		Assert.Equal(4, sources.BaseRespondentCount);
	}

	[Fact]
	public async Task FullCatalogDefaultsExplicitEmptyAndUnknownHaveDifferentMeanings()
	{
		var provider = new Provider();
		foreach (var name in new[] { "D", "E", "F", "G", "H", "I", "J" })
			provider.Add(2022, name);
		var handler = Handler(provider);
		var auto = await handler.Handle(Request("professions"), default);
		Assert.Equal(["Backend", "D", "E", "F", "Frontend", "G"], auto.Columns.Select(c => c.Value));
		Assert.Equal(10, auto.AvailableValues.Length);
		var empty = await handler.Handle(Request("professions", []), default);
		Assert.Empty(empty.Columns);
		Assert.Equal(auto.AvailableValues, empty.AvailableValues);
		var unknown = await handler.Handle(Request("cities", ["unknown", "AB", "unknown", "A B"]), default);
		Assert.Equal(["unknown", "AB", "A B"], unknown.Columns.Select(c => c.Value));
		Assert.Empty(unknown.Columns[0].Companies);
		Assert.Equal("unknown", unknown.Columns[0].Label);
		var none = await handler.Handle(Request("languages") with { Year = 2020 }, default);
		Assert.Empty(none.Columns);
		Assert.Empty(none.BaseCompanies);
		Assert.Contains(none.AvailableValues, v => v.Value == "C#" && v.RespondentCount == 0);
	}

	[Fact]
	public async Task CachePreservesBoundariesOrderYearAndGroupAndNormalizesEquivalentFilters()
	{
		var provider = new Provider();
		provider.Add(2022, "Other", "A,B");
		var handler = Handler(provider);
		foreach (var (values, expected) in new[] { (new[] { "A B" }, 1), (new[] { "AB" }, 1),
			(new[] { "A,B" }, 1), (new[] { "A", "B" }, 0) })
		{
			var result = await handler.Handle(Request("cities", ["AB", "A B"]) with { Filter = All with { Cities = values } }, default);
			Assert.Equal(expected, result.BaseRespondentCount);
			Assert.Equal(values.Contains("AB") ? 1 : 0, result.Columns[0].RespondentCount);
		}
		var request = Request("cities", ["AB", "A B"]) with { Filter = All with { Cities = ["AB", "A B", "AB"] } };
		var first = await handler.Handle(request, default);
		var reads = provider.Reads;
		var same = await handler.Handle(request with { Filter = All with { Cities = ["A B", "AB"], IsCommunity = "другое" } }, default);
		Assert.Equal(reads, provider.Reads);
		Assert.Equal(JsonSerializer.Serialize(first), JsonSerializer.Serialize(same));
		var reverse = await handler.Handle(request with { GroupValues = ["A B", "AB"] }, default);
		Assert.Equal(["A B", "AB"], reverse.Columns.Select(c => c.Value));
		var year = await handler.Handle(request with { Year = 2019 }, default);
		Assert.Equal(0, year.BaseRespondentCount);
		var group = await handler.Handle(request with { GroupBy = "professions" }, default);
		Assert.All(group.Columns, c => Assert.Equal(0, c.RespondentCount));
	}

	[Fact]
	public async Task ExtractedLegacyHandlersRetainAllFormulasCountsAndOrder()
	{
		var provider = new Provider();
		var filter = All with { Professions = ["Backend"] };
		var companies = await new GetCompanyModelsQueryHandler(provider, Cache()).Handle(filter.ToQuery<GetCompanyModelsQuery>(), default);
		Assert.Equal(new[] {
			new CompanyModel(A, 2022, 1, 0, .5, 2, 0, 1, 2, .0441),
			new CompanyModel("AB", 2022, 1, 0, 0, 1, 0, 0, 1, .0441),
			new CompanyModel(A, 2019, 1, 1, 1, 1, 1, 1, 1, .0441),
			new CompanyModel("AB", 2019, 1, 0, 0, 1, 0, 0, 1, .0441),
			new CompanyModel("Только 2021", 2021, 0, 0, 0, 0, 0, 0, 1, .0441)
		}, companies);
		var meta = await new GetMetaQueryHandler(provider, Cache()).Handle(filter.ToQuery<GetMetaQuery>(), default);
		Assert.Equal(new("Всего", 1, 0, 1, 4), meta.Total);
		Assert.Equal(new("Выбрано", 1, 0, 1, 2), meta.Filtered);
		Assert.Equal(["cities", "ages", "education", "levels", "professions", "languages", "isCommunity", "communitySource"], meta.Sources.Keys);
		Assert.Equal(new[] { new MetaModelTableRow("Other", 1, 0, 1, 0), new("A B", 0, 0, 0, 1), new("AB", 0, 0, 0, 1) }, meta.Sources["cities"]);
		Assert.Equal(new[] { new MetaModelTableRow("20 - 24", 0, 0, 0, 2), new("30 - 34", 1, 0, 0, 0), new("40 - 44", 0, 0, 1, 0) }, meta.Sources["ages"]);
		Assert.Equal(new[] { new MetaModelTableRow("Высшее", 1, 0, 1, 2) }, meta.Sources["education"]);
		Assert.Equal(new[] { new MetaModelTableRow("", 0, 0, 0, 1), new("Middle", 1, 0, 1, 1) }, meta.Sources["levels"]);
		Assert.Equal(new[] { new MetaModelTableRow("Backend", 1, 0, 1, 2) }, meta.Sources["professions"]);
		Assert.Equal(new[] { new MetaModelTableRow("C#", 0, 0, 1, 0), new("JavaScript", 0, 0, 0, 1), new(Combined, 1, 0, 0, 0), new("Python", 1, 0, 0, 1), new("TypeScript", 0, 0, 0, 1) }, meta.Sources["languages"]);
		Assert.Equal(new[] { new MetaModelTableRow("Нет", 1, 0, 1, 1), new("Да", 0, 0, 0, 1) }, meta.Sources["isCommunity"]);
		Assert.Equal(new[] { new MetaModelTableRow("Telegram", 1, 0, 0, 3), new("Митапы", 1, 0, 0, 1) }, meta.Sources["communitySource"]);
	}

	[Fact]
	public async Task InvalidRequestsAreRejectedBeforeMapping()
	{
		var invalid = new[] {
			Request() with { Year = 2031 }, Request() with { GroupBy = "Languages" },
			Request() with { GroupBy = "1" }, Request() with { GroupBy = null },
			Request() with { Filter = null }, Request(values: new string[257]),
			Request(values: [null]), Request("isCommunity", ["True"]), Request("ages", ["060"]),
			Request("ages", ["21"]), Request("ages", ["2147483645"]),
			Request() with { Filter = All with { Ages = ["oops"] } },
			Request() with { Filter = All with { Ages = ["20 - 25 лет"] } },
			Request() with { Filter = All with { Ages = ["21 - 25 лет"] } },
			Request() with { Filter = All with { Cities = null! } },
			Request() with { Filter = All with { Cities = [null!] } },
			Request() with { Filter = All with { Cities = Enumerable.Repeat("a", 128).ToArray(), Languages = Enumerable.Repeat("b", 129).ToArray() } }
		};
		var provider = new Provider();
		var handler = Handler(provider);
		foreach (var request in invalid)
		{
			Assert.NotEmpty(GetAudienceMatrixQueryHandler.Validate(request));
			await Assert.ThrowsAsync<ArgumentException>(async () => await handler.Handle(request, default));
		}
		Assert.Equal(0, provider.Reads);
		Assert.Empty(GetAudienceMatrixQueryHandler.Validate(Request("experiences", [null, "", "null"])));
		Assert.Empty(GetAudienceMatrixQueryHandler.Validate(Request("ages", ["60"])));
	}

	[Fact]
	public void YearRequiresJsonIntegerEvenWithWebSerializerDefaults()
	{
		var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
		Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<AudienceMatrixRequest>("{\"year\":\"2022\"}", options));
		Assert.Equal(2022, JsonSerializer.Deserialize<AudienceMatrixRequest>("{\"year\":2022}", options)!.Year);
	}

	private sealed class Provider : IIntervieweesDataProvider
	{
		private readonly Dictionary<IntervieweeModel, AnswerModel[]> data = new();
		public int Reads { get; private set; }
		public Provider()
		{
			Add(2022, "Backend", "A B", 20, "Middle", ["JavaScript", "Python"], ["Telegram", "Митапы", "Telegram"], true,
				[(A, true, false, true), ("AB", true, false, false)]);
			Add(2022, "Backend", "AB", 24, "", ["TypeScript"], ["Telegram"], false, [(A, true, false, false)]);
			Add(2022, "Frontend", "Other", 25, "Middle", [Combined, "Python"], ["Митапы"], true,
				[(A, false, true, false), ("AB", false, false, false)]);
			Add(2022, "QA", "Other", 64, null, ["Python"], [], false, [(A, false, false, false)]);
			Add(2019, "Backend", "Other", 30, "Middle", [Combined, "Python"], ["Telegram", "Митапы"], false,
				[(A, false, true, true), ("AB", true, false, false)]);
			Add(2021, "Backend", "Other", 44, "Middle", ["C#"], [], false, [("Только 2021", false, false, false)]);
		}
		public void Add(int year, string profession, string city = "Other", int age = 20, string? grade = "Middle",
			string[]? languages = null, string[]? sources = null, bool community = false,
			(string Name, bool Known, bool Good, bool Wanted)[]? answers = null)
		{
			var id = Guid.NewGuid();
			data.Add(new(id, age, "Высшее", profession, grade, city, community, year, languages ?? [], sources ?? []),
				(answers ?? [(A, false, false, false)]).Select(a => new AnswerModel(id, a.Name, a.Known, a.Good, a.Wanted)).ToArray());
		}
		public IntervieweeModel[] GetAllInterviewees() => data.Keys.ToArray();
		public ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> GetAllIntervieweeAnswers()
		{
			Reads++;
			return data.AsReadOnly();
		}
	}
}
