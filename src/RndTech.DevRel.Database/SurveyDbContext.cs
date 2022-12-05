using Microsoft.EntityFrameworkCore;
using RndTech.DevRel.Database.Models;

namespace RndTech.DevRel.Database;

public class SurveyDbContext : DbContext
{
	public DbSet<Company> Companies { get; set; }
	public DbSet<Interviewee> Interviewees { get; set; }
	public DbSet<CompanyAnswer> CompanyAnswers { get; set; }
	public DbSet<IntervieweeLanguage> IntervieweeLanguages { get; set; }
	public DbSet<Language> Languages { get; set; }
	public DbSet<IntervieweeCommunitySource> IntervieweeCommunitySources { get; set; }
	public DbSet<CommunitySource> CommunitySources { get; set; }
	
	public SurveyDbContext(DbContextOptions options)
		: base(options)
	{
	}
	
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(SurveyDbContext).Assembly);
	}
}
