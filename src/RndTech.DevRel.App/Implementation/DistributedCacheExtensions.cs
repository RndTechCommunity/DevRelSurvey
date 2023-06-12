using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Configuration;

namespace RndTech.DevRel.App.Implementation;

public static class DistributedCacheExtensions
{
	public static async Task<T> GetValueOrCreateAsync<T>(this IDistributedCache cache, string key, Func<Task<T>> generator)
	{
		var cachedValueBytes = await cache.GetAsync(key);
		if (cachedValueBytes != null)
		{
			var cachedValue = JsonSerializer.Deserialize<T>(cachedValueBytes);
			if (cachedValue != null)
			{
				return cachedValue;
			}
		}

		var generatedValue = await generator();
		var generatedValueBytes = JsonSerializer.SerializeToUtf8Bytes(generatedValue);
		await cache.SetAsync(
			key, 
			generatedValueBytes,
			new DistributedCacheEntryOptions { SlidingExpiration = AppSettings.CacheTimeSpan });

		return generatedValue;
	}
}