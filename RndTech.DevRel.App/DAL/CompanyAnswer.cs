using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RndTech.DevRel.App.DAL
{
    public class CompanyAnswer
    {
        [Key]
        public int Id { get; set; }
        
        public int IntervieweeId { get; set; }
        public Interviewee Interviewee { get; set; }
        
        public int CompanyId { get; set; }
        public Company Company { get; set; }
        
        [Required]
        public bool IsKnown { get; set; }
        
        [Required]
        public bool IsGood { get; set; }
        
        [Required]
        public bool IsWanted { get; set; }
    }
}