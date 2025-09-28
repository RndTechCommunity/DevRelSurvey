using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Repositories;

namespace RndTech.DevRel.App.Services;

public class CompanyService : ICompanyService
{
    private readonly ICompanyRepository companyRepository;

    public CompanyService(ICompanyRepository companyRepository)
    {
        this.companyRepository = companyRepository;
    }

    public Task<CompanyModel[]> GetCompanyModelsAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        return companyRepository.GetCompanyModelsAsync(filter, cancellationToken);
    }
}