using Enyim.Caching;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class DatabaseQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
{
	private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;
	private readonly IMemcachedClient cache;

	protected DatabaseQueryHandlerBase(IDbContextFactory<SurveyDbContext> dbContextFactory, IMemcachedClient cache)
	{
		this.dbContextFactory = dbContextFactory;
		this.cache = cache;

	}

	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct) =>
		await cache.GetValueOrCreateAsync($"Filters_{GetType().Name}",
			AppSettings.CacheSeconds,
			async () =>
			{
				var db = await dbContextFactory.CreateDbContextAsync(ct);
				return await HandleInternal(db, query, ct);
			});

	protected abstract ValueTask<TResult> HandleInternal(SurveyDbContext db, TQuery query, CancellationToken ct);
}
