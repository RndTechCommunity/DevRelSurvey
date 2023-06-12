using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetExperienceLevelsQueryHandler : DatabaseQueryHandlerBase<GetExperienceLevelsQuery, string[]>
{
	public GetExperienceLevelsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory, IDistributedCache cache) 
		: base(dbContextFactory, cache)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetExperienceLevelsQuery query, CancellationToken ct)
		=> await db
			.Interviewees
			.GroupBy(i => i.ProfessionLevel)
			.Select(g => g.Key)
			.ToArrayAsync(ct);
}
