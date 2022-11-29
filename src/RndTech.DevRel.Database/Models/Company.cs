namespace RndTech.DevRel.Database.Models;

public class Company
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public ICollection<CompanyAnswer> Answers { get; set; }
}