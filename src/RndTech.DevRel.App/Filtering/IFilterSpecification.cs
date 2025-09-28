using System.Linq.Expressions;

namespace RndTech.DevRel.App.Filtering;

/// <summary>
/// Спецификация фильтра для типа T.
/// </summary>
/// <typeparam name="T">Тип данных для фильтрации</typeparam>
public interface IFilterSpecification<T>
{
    /// <summary>
    /// Возвращает выражение для фильтрации.
    /// </summary>
    Expression<Func<T, bool>> ToExpression();
}