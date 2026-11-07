namespace RndTech.DevRel.App.Configuration;

public static class AppSettings
{
	public static TimeSpan CacheTimeSpan => TimeSpan.FromSeconds(60 * 60 * 24);
	public static long CacheSizeLimitBytes => 32 * 1024 * 1024;
}
