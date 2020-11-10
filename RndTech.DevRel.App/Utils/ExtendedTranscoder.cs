using System;
using Enyim.Caching.Memcached;
using Newtonsoft.Json;

namespace RndTech.DevRel.App.Utils
{
    public sealed class ExtendedTranscoder : DefaultTranscoder
    {
        public override T Deserialize<T>(CacheItem item)
        {
            try
            {
                return base.Deserialize<T>(item);
            }
            catch (Exception)
            {
                return JsonConvert.DeserializeObject<T>(Deserialize(item).ToString() ?? "");
            }
        }
    }
}