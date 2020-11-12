using System;
using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.DAL
{
    public class Company
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; }
    }
}