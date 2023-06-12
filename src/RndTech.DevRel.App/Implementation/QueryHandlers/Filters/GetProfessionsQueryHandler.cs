using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetProfessionsQueryHandler : DatabaseQueryHandlerBase<GetProfessionsQuery, string[]>
{
	public GetProfessionsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory, IDistributedCache cache) 
		: base(dbContextFactory, cache)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetProfessionsQuery query, CancellationToken ct)
		=> await db
			.Interviewees
			.GroupBy(i => i.Profession)
			.OrderByDescending(g => g.Count())
			.Select(g => g.Key)
			.ToArrayAsync(ct);
}
