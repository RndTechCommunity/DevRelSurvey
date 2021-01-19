using System;

namespace RndTech.DevRel.App.Model.Survey2020
{
	public class CompanyNameAttribute : Attribute
	{
		public string Name { get; }

		public CompanyNameAttribute(string name)
		{
			Name = name;
		}
	}
}