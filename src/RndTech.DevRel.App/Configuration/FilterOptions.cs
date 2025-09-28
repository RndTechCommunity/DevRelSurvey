using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.Configuration;

/// <summary>
/// Настройки фильтрации данных.
/// </summary>
public class FilterOptions
{
    public const string SectionName = "FilterConfiguration";

    /// <summary>
    /// Настройки возрастных диапазонов.
    /// </summary>
    public Dictionary<string, AgeRange> AgeRanges { get; set; } = new();

    /// <summary>
    /// Маппинг языков программирования.
    /// </summary>
    public Dictionary<string, string[]> LanguageMappings { get; set; } = new();
}

/// <summary>
/// Возрастной диапазон.
/// </summary>
public class AgeRange : IValidatableObject
{
    [Range(1, 100, ErrorMessage = "Minimum age must be between 1 and 100")]
    public int Min { get; set; }

    [Range(1, 100, ErrorMessage = "Maximum age must be between 1 and 100")]
    public int Max { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Min > Max)
        {
            yield return new ValidationResult(
                "Minimum age cannot be greater than maximum age",
                new[] { nameof(Min), nameof(Max) });
        }

        if (Max - Min > 50)
        {
            yield return new ValidationResult(
                "Age range cannot exceed 50 years",
                new[] { nameof(Min), nameof(Max) });
        }
    }
}