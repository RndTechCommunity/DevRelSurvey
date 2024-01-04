using System.Collections.ObjectModel;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App.Implementation;

public interface IIntervieweesDataProvider
{
	IntervieweeModel[] GetAllInterviewees();
	ReadOnlyDictionary<IntervieweeModel, AnswerModel[]> GetAllIntervieweeAnswers();
}
