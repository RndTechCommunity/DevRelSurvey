namespace RndTech.DevRel.App.Model;

public record AnswerModel(Guid IntervieweeId, string CompanyName, bool IsKnown, bool IsGood, bool IsWanted);
