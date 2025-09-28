using RndTech.DevRel.App.Queries;

namespace RndTech.DevRel.App.QueryHandlers;

public interface IQueryHandler<in TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken = default);
}