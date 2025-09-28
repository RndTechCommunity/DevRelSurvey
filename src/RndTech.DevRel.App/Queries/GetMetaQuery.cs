using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Queries;

public record GetMetaQuery(UserFilter Filter) : IQuery<MetaModel>;