﻿namespace RndTech.DevRel.App.Model.Queries;

public interface IFilteredIntervieweesQuery
{
	public int[] Ages { get; init; }
	public string[] Cities { get; init; }
	public string[] Educations { get; init; }
	public string[] Experiences { get; init; }
	public string[] Professions { get; init; }
	public string[] ProgrammingLanguages { get; init; }
	public bool? IsCommunity { get; init; }
}
