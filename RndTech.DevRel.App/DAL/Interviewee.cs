using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RndTech.DevRel.App.DAL
{
    public class Interviewee
    {
        [Key]
        public Guid Id { get; set; }
        
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
        
        [Required]
        public int Year { get; set; }
        
        [Required]
        public bool IsCommunity { get; set; }
        
        public ICollection<IntervieweeLanguage> Languages { get; set; }
        public ICollection<IntervieweeMotivationFactor> MotivationFactors { get; set; }
        public ICollection<IntervieweeCommunitySource> CommunitySources { get; set; }
        
        
    }
}