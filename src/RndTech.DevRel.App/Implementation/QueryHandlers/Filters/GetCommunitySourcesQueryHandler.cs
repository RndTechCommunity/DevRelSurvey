﻿using Enyim.Caching;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetCommunitySourcesQueryHandler : DatabaseQueryHandlerBase<GetCommunitySourcesQuery, string[]>
{
	public GetCommunitySourcesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory, IMemcachedClient cache) 
		: base(dbContextFactory, cache)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetCommunitySourcesQuery query, CancellationToken ct)
		=> await db
			.CommunitySources
			.Select(cs => cs.Name)
			.ToArrayAsync(ct);
}
