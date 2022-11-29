using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetEducationsQueryHandler : DatabaseQueryHandlerBase<GetEducationsQuery, string[]>
{
	public GetEducationsQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory) : base(dbContextFactory)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetEducationsQuery query, CancellationToken ct)
		=> await db
			.Interviewees
			.GroupBy(i => i.Education)
			.OrderByDescending(g => g.Count())
			.Select(g => g.Key)
			.ToArrayAsync(ct);
}
