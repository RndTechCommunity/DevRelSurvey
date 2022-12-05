namespace RndTech.DevRel.App.Implementation.QueryHandlers;

public interface IQueryHandler<in TQuery, TResult>
{
	ValueTask<TResult> Handle(TQuery query, CancellationToken ct);
}
