using RndTech.DevRel.App.Implementation.QueryHandlers;

namespace RndTech.DevRel.App.Configuration;

public static class ServiceCollectionExtensions
{
	public static IServiceCollection AddQueryHandler<TQuery, TResult, TQueryHandler>(this IServiceCollection services)
		where TQueryHandler : class, IQueryHandler<TQuery, TResult>
	{
		services.AddTransient<IQueryHandler<TQuery, TResult>, TQueryHandler>();
		return services;
	}
}
