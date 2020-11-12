using System;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
    public class IntervieweeLanguage
    {
        public int IntervieweeId { get; set; }
        public Interviewee Interviewee { get; set; }
        public int LanguageId { get; set; }
        public Language Language { get; set; }
    }
}