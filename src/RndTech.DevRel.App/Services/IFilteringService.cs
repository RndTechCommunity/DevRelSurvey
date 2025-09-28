using System.Collections.ObjectModel;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Services;

/// <summary>
/// Сервис фильтрации данных интервьюируемых.
/// </summary>
public interface IFilteringService
{
    /// <summary>
    /// Фильтрует интервьюируемых по заданному фильтру.
    /// </summary>
    IEnumerable<IntervieweeModel> FilterInterviewees(
        IEnumerable<IntervieweeModel> interviewees,
        UserFilter filter);

    /// <summary>
    /// Фильтрует данные интервьюируемых с ответами по заданному фильтру.
    /// </summary>
    IDictionary<IntervieweeModel, AnswerModel[]> FilterIntervieweeAnswers(
        ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> answers,
        UserFilter filter);
}