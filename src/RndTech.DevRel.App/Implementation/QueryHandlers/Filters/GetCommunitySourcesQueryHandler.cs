using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetCommunitySourcesQueryHandler : DatabaseQueryHandlerBase<GetCommunitySourcesQuery, string[]>
{
	public GetCommunitySourcesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory, IDistributedCache cache) 
		: base(dbContextFactory, cache)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetCommunitySourcesQuery query, CancellationToken ct)
		=> await db
			.CommunitySources
			.Select(cs => cs.Name)
			.ToArrayAsync(ct);
}
