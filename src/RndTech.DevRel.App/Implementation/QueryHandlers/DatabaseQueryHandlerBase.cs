using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class DatabaseQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
{
	private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;
	private readonly IDistributedCache cache;

	protected DatabaseQueryHandlerBase(IDbContextFactory<SurveyDbContext> dbContextFactory, IDistributedCache cache)
	{
		this.dbContextFactory = dbContextFactory;
		this.cache = cache;

	}

	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct) =>
		await cache.GetValueOrCreateAsync($"Data2022_Filters_{GetType().Name}",
			async () =>
			{
				var db = await dbContextFactory.CreateDbContextAsync(ct);
				return await HandleInternal(db, query, ct);
			});

	protected abstract ValueTask<TResult> HandleInternal(SurveyDbContext db, TQuery query, CancellationToken ct);
}
