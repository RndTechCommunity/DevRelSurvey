using System;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
    public class Company
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
    }
}