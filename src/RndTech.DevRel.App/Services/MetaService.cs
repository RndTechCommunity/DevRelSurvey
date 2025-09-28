using RndTech.DevRel.App.Model;
using RndTech.DevRel.App.Repositories;

namespace RndTech.DevRel.App.Services;

public class MetaService : IMetaService
{
    private readonly IIntervieweeRepository intervieweeRepository;

    public MetaService(IIntervieweeRepository intervieweeRepository)
    {
        this.intervieweeRepository = intervieweeRepository;
    }

    public Task<MetaModel> GetMetaAsync(UserFilter filter, CancellationToken cancellationToken = default)
    {
        return intervieweeRepository.GetMetaAsync(filter, cancellationToken);
    }
}