namespace RndTech.DevRel.App.Services;

public interface IFilterService
{
    Task<string[]> GetCitiesAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetCommunitySourcesAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetEducationsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetExperienceLevelsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetProfessionsAsync(CancellationToken cancellationToken = default);
    Task<string[]> GetProgrammingLanguagesAsync(CancellationToken cancellationToken = default);
}