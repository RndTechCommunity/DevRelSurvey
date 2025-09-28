using RndTech.DevRel.App.Repositories;

namespace RndTech.DevRel.App.Services;

public class FilterService : IFilterService
{
    private readonly IFilterRepository filterRepository;

    public FilterService(IFilterRepository filterRepository)
    {
        this.filterRepository = filterRepository;
    }

    public Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetCitiesAsync(cancellationToken);
    }

    public Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetCommunitySourcesAsync(cancellationToken);
    }

    public Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetEducationsAsync(cancellationToken);
    }

    public Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetExperienceLevelsAsync(cancellationToken);
    }

    public Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetProfessionsAsync(cancellationToken);
    }

    public Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return filterRepository.GetProgrammingLanguagesAsync(cancellationToken);
    }
}