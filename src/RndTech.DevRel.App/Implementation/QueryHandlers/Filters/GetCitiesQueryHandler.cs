using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetCitiesQueryHandler : DatabaseQueryHandlerBase<GetCitiesQuery, string[]>
{
	public GetCitiesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory) : base(dbContextFactory)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetCitiesQuery query, CancellationToken ct) =>
		await db
			.Interviewees
			.GroupBy(i => i.City)
			.Where(g => g.Count() > 2)
			.OrderByDescending(g => g.Count())
			.Select(g => g.Key)
			.ToArrayAsync(ct);
}
