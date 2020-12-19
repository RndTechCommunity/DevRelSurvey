using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
    public class Language
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        public ICollection<IntervieweeLanguage> Interviewees { get; set; } 
    }
}