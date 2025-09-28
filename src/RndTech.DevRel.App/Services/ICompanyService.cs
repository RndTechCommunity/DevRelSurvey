using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

public interface ICompanyService
{
    Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default);
}