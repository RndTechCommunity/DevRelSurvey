using System.Linq.Expressions;

namespace RndTech.DevRel.App.Filtering;

/// <summary>
/// Builder для создания композитных Expression<Func<T, bool>>.
/// </summary>
/// <typeparam name="T">Тип данных для фильтрации</typeparam>
public class FilterExpressionBuilder<T>
{
    private Expression<Func<T, bool>>? expression;

    /// <summary>
    /// Добавляет условие через логическое И.
    /// </summary>
    public FilterExpressionBuilder<T> And(Expression<Func<T, bool>> condition)
    {
        expression = expression == null ? condition : CombineWithAnd(expression, condition);
        return this;
    }

    /// <summary>
    /// Добавляет условие через логическое ИЛИ.
    /// </summary>
    public FilterExpressionBuilder<T> Or(Expression<Func<T, bool>> condition)
    {
        expression = expression == null ? condition : CombineWithOr(expression, condition);
        return this;
    }

    /// <summary>
    /// Строит финальное выражение.
    /// </summary>
    public Expression<Func<T, bool>> Build()
    {
        return expression ?? (_ => true);
    }

    private static Expression<Func<T, bool>> CombineWithAnd(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = Expression.Parameter(typeof(T));
        var leftBody = ReplaceParameter(left.Body, left.Parameters[0], parameter);
        var rightBody = ReplaceParameter(right.Body, right.Parameters[0], parameter);
        var body = Expression.AndAlso(leftBody, rightBody);
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    private static Expression<Func<T, bool>> CombineWithOr(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = Expression.Parameter(typeof(T));
        var leftBody = ReplaceParameter(left.Body, left.Parameters[0], parameter);
        var rightBody = ReplaceParameter(right.Body, right.Parameters[0], parameter);
        var body = Expression.OrElse(leftBody, rightBody);
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    private static Expression ReplaceParameter(Expression expression, ParameterExpression oldParam, ParameterExpression newParam)
    {
        return new ParameterReplacer(oldParam, newParam).Visit(expression);
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression oldParam;
        private readonly ParameterExpression newParam;

        public ParameterReplacer(ParameterExpression oldParam, ParameterExpression newParam)
        {
            this.oldParam = oldParam;
            this.newParam = newParam;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == oldParam ? newParam : node;
        }
    }
}