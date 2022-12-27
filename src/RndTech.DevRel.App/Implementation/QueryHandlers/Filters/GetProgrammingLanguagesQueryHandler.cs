﻿using Enyim.Caching;
using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.App.Model.Queries;
using RndTech.DevRel.Database;

namespace RndTech.DevRel.App.Implementation.QueryHandlers.Filters;

public class GetProgrammingLanguagesQueryHandler : DatabaseQueryHandlerBase<GetProgrammingLanguagesQuery, string[]>
{
	public GetProgrammingLanguagesQueryHandler(IDbContextFactory<SurveyDbContext> dbContextFactory, IMemcachedClient cache) 
		: base(dbContextFactory, cache)
	{
	}

	protected override async ValueTask<string[]> HandleInternal(SurveyDbContext db, GetProgrammingLanguagesQuery query, CancellationToken ct)
		=> await db
			.Languages
			.Select(l => l.Name)
			.Where(l => l != "JavaScript / TypeScript")
			.OrderBy(l => l)
			.ToArrayAsync(ct);
}
