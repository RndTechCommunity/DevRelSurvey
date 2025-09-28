using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string ConnectionString { get; set; } = string.Empty;

    [Range(1, 300)]
    public int CommandTimeout { get; set; } = 120;
}