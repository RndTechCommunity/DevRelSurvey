using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Queries;

public record GetCompanyModelsQuery(UserFilter Filter) : IQuery<CompanyModel[]>;