using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

public interface ICompanyService
{
    Task<CompanyModel[]> GetCompaniesAsync(UserFilter filter, CancellationToken cancellationToken = default);
}