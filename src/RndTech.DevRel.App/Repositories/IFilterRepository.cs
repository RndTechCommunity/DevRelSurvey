namespace RndTech.DevRel.App.Repositories;

public interface IFilterRepository
{
    Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default);
}