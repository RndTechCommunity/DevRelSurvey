using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.Configuration;

public class CacheOptions
{
    public const string SectionName = "Cache";

    public string? RedisConnectionString { get; set; }

    public bool UseInMemoryCache => string.IsNullOrEmpty(RedisConnectionString);

    [Range(60, 604800, ErrorMessage = "Cache expiration must be between 1 minute and 7 days")]
    public int ExpirationSeconds { get; set; } = 86400; // 24 hours in seconds

    public TimeSpan CacheTimeSpan => TimeSpan.FromSeconds(ExpirationSeconds);
}