using System.Text.Json.Serialization;

namespace RndTech.DevRel.App.Model;

/// <summary>Один год, общий фильтр и дополнительное условие каждой колонки.</summary>
public record AudienceMatrixRequest([property: JsonNumberHandling(JsonNumberHandling.Strict)] int Year, UserFilter? Filter, string? GroupBy, string?[]? GroupValues)
{
	public const int MaxValues = 256;
	public const int MaxBodyBytes = 1024 * 1024;
}

/// <summary>Полный каталог измерения с числом людей текущего года и общего фильтра.</summary>
public record AudienceGroupOption(string? Value, string Label, int RespondentCount);

/// <summary>Число людей колонки отдельно от selectionCount каждой компании.</summary>
public record AudienceMatrixColumn(string? Value, string Label, int RespondentCount, CompanyModel[] Companies);

/// <summary>Агрегаты базы и колонок; исходные имена компаний охватывают все годы.</summary>
public record AudienceMatrixResponse(int Year, string GroupBy, int BaseRespondentCount,
	string[] CompanyNames, CompanyModel[] BaseCompanies, AudienceGroupOption[] AvailableValues,
	AudienceMatrixColumn[] Columns);
