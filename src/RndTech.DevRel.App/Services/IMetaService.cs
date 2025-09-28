using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

public interface IMetaService
{
    Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default);
}