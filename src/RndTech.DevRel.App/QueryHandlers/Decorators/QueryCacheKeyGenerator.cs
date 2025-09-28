using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace RndTech.DevRel.App.QueryHandlers.Decorators;

public static class QueryCacheKeyGenerator
{
    public static string Generate<TQuery>(TQuery query) where TQuery : notnull
    {
        var queryType = typeof(TQuery).Name;
        var serialized = JsonSerializer.Serialize(query, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var hash = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(serialized)))[..16];

        return $"{queryType}_{hash}";
    }
}