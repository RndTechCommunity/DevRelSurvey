using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Repositories;

public interface ICompanyRepository
{
    Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default);
}