using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public abstract class DatabaseQueryHandlerBase<TQuery, TResult> : IQueryHandler<TQuery, TResult>
{
	private readonly IDbContextFactory<SurveyDbContext> dbContextFactory;

	protected DatabaseQueryHandlerBase(IDbContextFactory<SurveyDbContext> dbContextFactory)
	{
		this.dbContextFactory = dbContextFactory;

	}
	
	public async ValueTask<TResult> Handle(TQuery query, CancellationToken ct)
	{
		var db = await dbContextFactory.CreateDbContextAsync(ct);
		return await HandleInternal(db, query, ct);
	}

	protected abstract ValueTask<TResult> HandleInternal(SurveyDbContext db, TQuery query, CancellationToken ct);
}
