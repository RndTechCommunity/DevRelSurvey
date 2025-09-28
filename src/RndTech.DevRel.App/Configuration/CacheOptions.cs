namespace RndTech.DevRel.App.Configuration;

public class CacheOptions
{
    public const string SectionName = "Cache";

    public string? RedisConnectionString { get; set; }

    public bool UseInMemoryCache => string.IsNullOrEmpty(RedisConnectionString);

    public int ExpirationSeconds { get; set; } = 86400; // 24 hours in seconds

    public TimeSpan CacheTimeSpan => TimeSpan.FromSeconds(ExpirationSeconds);
}