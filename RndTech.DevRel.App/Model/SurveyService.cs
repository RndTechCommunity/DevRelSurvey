using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using RndTech.DevRel.App.DAL;

namespace RndTech.DevRel.App.Model
{
    public static class SurveyService
    {
        public static IEnumerable<CompanyModel> GetCompanyModels(
            SurveyDbContext dbContext,
            int[] agesFilter,
            string[] citiesFilter,
            string[] educationFilter,
            string[] experienceLevelFilter,
            string[] professionFilter,
            string[] programmingLanguageFilter,
            bool? isCommunityFilter)
        {
            IQueryable<CompanyAnswer> answers = dbContext.CompanyAnswers;
            if(agesFilter.Length != 0)
                answers = answers.Where(a => agesFilter.Contains(a.Interviewee.Age));
            if(citiesFilter.Length != 0)
                answers = answers.Where(a => citiesFilter.Contains(a.Interviewee.City));
            if(educationFilter.Length != 0)
                answers = answers.Where(a => educationFilter.Contains(a.Interviewee.Education));
            if(experienceLevelFilter.Length != 0)
                answers = answers.Where(a => experienceLevelFilter.Contains(a.Interviewee.ProfessionLevel));
            if(professionFilter.Length != 0)
                answers = answers.Where(a => professionFilter.Contains(a.Interviewee.Profession));
            if(programmingLanguageFilter.Length != 0)
                answers = answers.Where(a => programmingLanguageFilter.Intersect(a.Interviewee.Languages.Select(l => l.Language.Name)).Any());
            
            if (isCommunityFilter.HasValue)
            {
                var visitMeetupsFiler = isCommunityFilter.Value;
                answers = answers.Where(a => a.Interviewee.VisitMeetups == visitMeetupsFiler);
            }

            var groupedAnswers = answers
                .GroupBy(
                    a => a.Company.Name,
                    a => new {Known = a.IsKnown || a.IsWanted ? 1.0 : 0, Wanted = a.IsWanted ? 1.0 : 0})
                .Select(
                    g => new CompanyModel {Name = g.Key, KnownLevel = g.Sum(x => x.Known) / g.Count(), WantedLevel = g.Sum(x => x.Wanted) / g.Count()});

            return groupedAnswers.AsEnumerable();

        }


        public static string ToSql<TEntity>(IQueryable<TEntity> query) where TEntity : class
        {
            var enumerator = query.Provider.Execute<IEnumerable<TEntity>>(query.Expression).GetEnumerator();
            var relationalCommandCache = Private(enumerator, "_relationalCommandCache");
            var selectExpression = Private<SelectExpression>(relationalCommandCache, "_selectExpression");
            var factory = Private<IQuerySqlGeneratorFactory>(relationalCommandCache, "_querySqlGeneratorFactory");

            var sqlGenerator = factory.Create();
            var command = sqlGenerator.GetCommand(selectExpression);

            string sql = command.CommandText;
            return sql;
        }
        private static object Private(object obj, string privateField) => obj?.GetType().GetField(privateField, BindingFlags.Instance | BindingFlags.NonPublic)?.GetValue(obj);
        private static T Private<T>(object obj, string privateField) => (T)obj?.GetType().GetField(privateField, BindingFlags.Instance | BindingFlags.NonPublic)?.GetValue(obj);
    }
}