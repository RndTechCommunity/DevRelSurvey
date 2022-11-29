namespace RndTech.DevRel.App.Model;

/// <summary>
/// Фильтр для данных о компаниях.
/// </summary>
public record UserFilter(string[] Cities, 
	string[] Educations, 
	string[] Languages, 
	string[] Professions, 
	string[] Experiences, 
	string[] Ages, 
	string? IsCommunity, 
	int Year);