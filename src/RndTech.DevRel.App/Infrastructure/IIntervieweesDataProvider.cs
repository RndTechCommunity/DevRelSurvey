using System.Collections.ObjectModel;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Infrastructure;

public interface IIntervieweesDataProvider
{
	IntervieweeModel[] GetAllInterviewees();
	ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> GetAllIntervieweeAnswers();
}
