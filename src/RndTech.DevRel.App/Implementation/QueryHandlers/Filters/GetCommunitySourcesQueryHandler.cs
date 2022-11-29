using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetCommunitySourcesQueryHandler : DatabaseQueryHandlerBase<GetCommunitySourcesQuery, string[]>
{
	public GetCommunitySourcesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory) : base(dbContextFactory)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetCommunitySourcesQuery query, CancellationToken ct)
		=> await db
			.CommunitySources
			.Select(cs => cs.Name)
			.ToArrayAsync(ct);
}
