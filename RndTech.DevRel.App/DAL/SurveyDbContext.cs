using Microsoft.EntityFrameworkCore;

namespace RndTech.DevRel.App.DAL
{
    public class SurveyDbContext : DbContext
    {
        public SurveyDbContext(DbContextOptions options) : base(options)
        {
        }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>().HasIndex(c => c.Name);

            modelBuilder.Entity<Interviewee>().HasIndex(i => i.Age);
            modelBuilder.Entity<Interviewee>().HasIndex(i => i.Education);
            modelBuilder.Entity<Interviewee>().HasIndex(i => i.Profession);
            modelBuilder.Entity<Interviewee>().HasIndex(i => i.ProfessionLevel);
            modelBuilder.Entity<Interviewee>().HasIndex(i => i.VisitMeetups);

            modelBuilder.Entity<IntervieweeLanguage>().HasKey(il => new {il.IntervieweeId, il.LanguageId});
        }
        
        public DbSet<Company> Companies { get; set; }
        public DbSet<Interviewee> Interviewees { get; set; }
        public DbSet<CompanyAnswer> CompanyAnswers { get; set; }
        public DbSet<IntervieweeLanguage> IntervieweeLanguages { get; set; }
        public DbSet<Language> Languages { get; set; }
    }
}