using System.Globalization;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Mapping;
using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Model.Queries;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public class GetAudienceMatrixQueryHandler : IQueryHandler<AudienceMatrixRequest, AudienceMatrixResponse>
{
	private const string CombinedLanguage = "JavaScript / TypeScript";
	private readonly IIntervieweesDataProvider dataProvider;
	private readonly IDistributedCache cache;

	public GetAudienceMatrixQueryHandler(IIntervieweesDataProvider dataProvider, IDistributedCache cache)
	{
		this.dataProvider = dataProvider;
		this.cache = cache;
	}

	public async ValueTask<AudienceMatrixResponse> Handle(AudienceMatrixRequest request, CancellationToken ct)
	{
		ct.ThrowIfCancellationRequested();
		if (Validate(request).Count != 0)
			throw new ArgumentException("Invalid audience matrix request.", nameof(request));

		var query = request.Filter!.ToQuery<GetCompanyModelsQuery>();
		query = query with
		{
			Ages = query.Ages.Distinct().Order().ToArray(),
			Cities = Normalize(query.Cities), Educations = Normalize(query.Educations),
			Experiences = Normalize(query.Experiences), Professions = Normalize(query.Professions),
			ProgrammingLanguages = Normalize(query.ProgrammingLanguages)
		};
		var values = request.GroupValues?.Distinct(StringComparer.Ordinal).ToArray();
		var key = "AudienceMatrix_v1_" + Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(
			new { request.Year, request.GroupBy, Filter = query, GroupValues = values })));

		var result = await cache.GetValueOrCreateAsync(key, () =>
		{
			ct.ThrowIfCancellationRequested();
			var all = dataProvider.GetAllIntervieweeAnswers();
			var basis = SurveyAggregation.Filter(all, query).Where(pair => pair.Key.Year == request.Year).ToArray();
			var group = request.GroupBy!;
			var catalog = all.Keys.SelectMany(i => Values(i, group));
			if (group == "languages")
				catalog = catalog.SelectMany(value => value == CombinedLanguage ? new[] { "JavaScript", "TypeScript" } : new[] { value });
			if (group == "isCommunity")
				catalog = new[] { "true", "false" };
			catalog = catalog.Distinct(StringComparer.Ordinal);
			catalog = group == "ages" ? catalog.OrderBy(value => int.Parse(value!, CultureInfo.InvariantCulture)) : catalog.Order(StringComparer.Ordinal);
			var options = catalog.Select(value =>
			{
				ct.ThrowIfCancellationRequested();
				return new AudienceGroupOption(value, Label(group, value), basis.Count(pair => Matches(pair.Key, group, value)));
			}).ToArray();
			var selected = values ?? options.Where(option => option.RespondentCount > 0)
				.OrderByDescending(option => option.RespondentCount).ThenBy(option => option.Value, StringComparer.Ordinal)
				.Take(6).Select(option => option.Value).ToArray();
			var columns = selected.Select(value =>
			{
				ct.ThrowIfCancellationRequested();
				var members = basis.Where(pair => Matches(pair.Key, group, value)).ToArray();
				return new AudienceMatrixColumn(value, Label(group, value), members.Length, SurveyAggregation.Companies(members));
			}).ToArray();
			ct.ThrowIfCancellationRequested();
			return Task.FromResult(new AudienceMatrixResponse(request.Year, group, basis.Length,
				all.Values.SelectMany(answers => answers).Select(answer => answer.CompanyName).Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray(),
				SurveyAggregation.Companies(basis), options, columns));
		});
		ct.ThrowIfCancellationRequested();
		return result;
	}

	public static Dictionary<string, string[]> Validate(AudienceMatrixRequest request)
	{
		var errors = new Dictionary<string, string[]>();
		if (request.Year is not (2019 or 2020 or 2021 or 2022))
			errors["year"] = ["Выберите год с 2019 по 2022."];
		if (request.GroupBy is not ("professions" or "languages" or "ages" or "cities" or "educations" or "experiences" or "isCommunity" or "communitySources"))
			errors["groupBy"] = ["Неизвестное измерение."];
		if (request.Filter is not { } filter)
			errors["filter"] = ["Общий фильтр обязателен."];
		else
		{
			var arrays = new Dictionary<string, string[]?>
			{
				["cities"] = filter.Cities, ["educations"] = filter.Educations, ["languages"] = filter.Languages,
				["professions"] = filter.Professions, ["experiences"] = filter.Experiences, ["ages"] = filter.Ages
			};
			foreach (var (name, array) in arrays)
				if (array is null || array.Length > AudienceMatrixRequest.MaxValues || array.Any(value => value is null))
					errors[$"filter.{name}"] = ["Обязателен массив строк, не более 256 значений."];
			if (arrays.Values.Sum(array => (long)(array?.Length ?? 0)) > AudienceMatrixRequest.MaxValues)
				errors["filter"] = ["В фильтре допустимо суммарно не более 256 значений."];
			if (filter.Ages is not null && filter.Ages.Any(age => !ValidFilterAge(age)))
				errors["filter.ages"] = ["Возраст должен иметь вид 20 - 24 лет, начало кратно пяти."];
		}
		if (request.GroupValues is { } values)
		{
			if (values.Length > AudienceMatrixRequest.MaxValues)
				errors["groupValues"] = ["Выберите не более 256 колонок."];
			else if (values.Any(value => request.GroupBy switch
			{
				"experiences" => false,
				"ages" => !ValidAge(value),
				"isCommunity" => value is not ("true" or "false"),
				_ => value is null
			}))
				errors["groupValues"] = ["Значение колонки не соответствует измерению."];
		}
		return errors;
	}

	private static string[] Normalize(string[] values) => values.Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();

	private static bool ValidAge(string? value) => int.TryParse(value, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var start)
		&& start % 5 == 0 && start <= int.MaxValue - 4 && value == start.ToString(CultureInfo.InvariantCulture);

	private static bool ValidFilterAge(string? value) => value is not null
		&& Regex.IsMatch(value, @"\A[0-9]{2} - [0-9]{2} лет\z")
		&& int.Parse(value[..2], CultureInfo.InvariantCulture) % 5 == 0
		&& int.Parse(value[5..7], CultureInfo.InvariantCulture) == int.Parse(value[..2], CultureInfo.InvariantCulture) + 4;

	private static string?[] Values(IntervieweeModel person, string group) => group switch
	{
		"professions" => [person.Profession], "languages" => person.Languages,
		"ages" => [(person.Age / 5 * 5).ToString(CultureInfo.InvariantCulture)],
		"cities" => [person.City], "educations" => [person.Education], "experiences" => new string?[] { person.ProfessionLevel },
		"isCommunity" => [person.VisitMeetups ? "true" : "false"], "communitySources" => person.CommunitySources,
		_ => throw new ArgumentOutOfRangeException(nameof(group))
	};

	private static bool Matches(IntervieweeModel person, string group, string? value) => group switch
	{
		"languages" => person.Languages.Contains(value!) || value is "JavaScript" or "TypeScript" && person.Languages.Contains(CombinedLanguage),
		"ages" => person.Age >= int.Parse(value!, CultureInfo.InvariantCulture) && person.Age <= int.Parse(value!, CultureInfo.InvariantCulture) + 4,
		_ => Values(person, group).Contains(value, StringComparer.Ordinal)
	};

	private static string Label(string group, string? value)
	{
		if (group == "ages" && value is not null and not "")
		{
			var end = int.Parse(value, CultureInfo.InvariantCulture) + 4;
			var age = Math.Abs(end);
			var unit = age % 100 is >= 11 and <= 14 ? "лет" : (age % 10) switch
			{
				1 => "год", 2 or 3 or 4 => "года", _ => "лет"
			};
			return $"{value}–{end} {unit}";
		}
		return value switch
		{
			null => "Не указан",
			"" => "Пустое значение",
			_ => group == "isCommunity" ? value == "true" ? "Да" : "Нет" : value
		};
	}
}
