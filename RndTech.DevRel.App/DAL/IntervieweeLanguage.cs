using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RndTech.DevRel.App.DAL
{
    public class IntervieweeLanguage
    {
        [Required, ForeignKey(nameof(Interviewee))]
        public Guid IntervieweeId { get; set; }
        public Interviewee Interviewee { get; set; }
        
        [Required, ForeignKey(nameof(Language))]
        public Guid LanguageId { get; set; }
        public Language Language { get; set; }
    }
}