using Microsoft.Extensions.Options;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Filtering;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

/// <summary>
/// Конвертер значений фильтра с конфигурируемыми правилами.
/// </summary>
public class FilterValueConverter
{
    private readonly FilterOptions configuration;

    public FilterValueConverter(IOptions<FilterOptions> configuration)
    {
        this.configuration = configuration.Value;
    }

    /// <summary>
    /// Конвертирует пользовательский фильтр в фильтр для запроса.
    /// </summary>
    public FilteredIntervieweesQuery Convert(UserFilter filter)
    {
        return new FilteredIntervieweesQuery
        {
            Ages = ConvertAges(filter.Ages),
            Cities = filter.Cities,
            Educations = filter.Educations,
            Experiences = filter.Experiences,
            Professions = filter.Professions,
            ProgrammingLanguages = ConvertLanguages(filter.Languages),
            IsCommunity = ConvertCommunity(filter.IsCommunity),
        };
    }

    private int[] ConvertAges(string[] ageRanges)
    {
        var ages = new List<int>();

        foreach (var ageRange in ageRanges)
        {
            if (configuration.AgeRanges.TryGetValue(ageRange, out var range))
            {
                ages.AddRange(Enumerable.Range(range.Min, range.Max - range.Min + 1));
            }
            else if (TryParseAgeRangeFromString(ageRange, out var parsedRange))
            {
                ages.AddRange(Enumerable.Range(parsedRange.Min, parsedRange.Max - parsedRange.Min + 1));
            }
        }

        return ages.Distinct().ToArray();
    }

    private string[] ConvertLanguages(string[] languages)
    {
        if (languages.Length == 0)
            return languages;

        var result = new List<string>(languages);

        // Применяем маппинг из конфигурации
        foreach (var (key, mappedLanguages) in configuration.LanguageMappings)
        {
            if (languages.Any(lang => mappedLanguages.Contains(lang)))
            {
                result.Add(key);
            }
        }

        // Дефолтная логика для JavaScript/TypeScript если нет в конфигурации
        if (!configuration.LanguageMappings.ContainsKey("JavaScript / TypeScript") &&
            (languages.Contains("JavaScript") || languages.Contains("TypeScript")))
        {
            result.Add("JavaScript / TypeScript");
        }

        return result.Distinct().ToArray();
    }

    private static bool? ConvertCommunity(string? isCommunity)
    {
        return isCommunity switch
        {
            "Да" => true,
            "Нет" => false,
            _ => null
        };
    }

    private static bool TryParseAgeRangeFromString(string ageRange, out AgeRange range)
    {
        range = new AgeRange();

        // Пробуем парсить формат "18-25"
        var parts = ageRange.Split('-');
        if (parts.Length == 2 &&
            int.TryParse(parts[0], out var min) &&
            int.TryParse(parts[1], out var max))
        {
            range.Min = min;
            range.Max = max;
            return true;
        }

        // Fallback на старую логику если не удалось распарсить
        if (ageRange.Length >= 2 && int.TryParse(ageRange.Substring(0, 2), out var ageStart))
        {
            range.Min = ageStart;
            range.Max = ageStart + 4;
            return true;
        }

        return false;
    }
}