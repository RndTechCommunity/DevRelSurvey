using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
    public class Interviewee
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int Age { get; set; }
        
        [Required]
        public string Education { get; set; }
        
        [Required]
        public string Profession { get; set; }
        
        [Required]
        public string ProfessionLevel { get; set; }
        
        [Required]
        public string City { get; set; }
        
        [Required]
        public bool VisitMeetups { get; set; }
        
        public ICollection<IntervieweeLanguage> Languages { get; set; } 
    }
}