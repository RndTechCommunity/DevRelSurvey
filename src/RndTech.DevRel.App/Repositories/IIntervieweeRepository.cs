using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Repositories;

public interface IIntervieweeRepository
{
    Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default);
}