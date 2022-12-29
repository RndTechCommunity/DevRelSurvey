namespace RndTech.DevRel.App.Model;

/// <summary>
/// Данные 1 строки группировки в выборке в разрезе по годам.
/// </summary>
public record MetaModelTableRow(string Name, int Count2019, int Count2020, int Count2021, int Count2022);

/// <summary>
/// Данные о составе выборки, соответствующей фильтрм.
/// </summary>
public record MetaModel(MetaModelTableRow Total, MetaModelTableRow Filtered, Dictionary<string, MetaModelTableRow[]> Sources);