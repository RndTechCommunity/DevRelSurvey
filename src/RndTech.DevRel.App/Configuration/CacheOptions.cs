namespace RndTech.DevRel.App.Configuration;

public class CacheOptions
{
    public const string SectionName = "Cache";

    public string? RedisConnectionString { get; set; }

    public bool UseInMemoryCache => string.IsNullOrEmpty(RedisConnectionString);

    public int ExpirationHours { get; set; } = 24;

    public TimeSpan CacheTimeSpan => TimeSpan.FromHours(ExpirationHours);
}