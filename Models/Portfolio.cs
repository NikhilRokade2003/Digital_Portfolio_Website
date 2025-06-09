using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
    public class Portfolio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Title { get; set; }

        public required string Description { get; set; }

        public required string ProfileImage { get; set; }

        public bool IsPublic { get; set; } = true;

        // Section visibility flags
        public bool IsProjectsPublic { get; set; } = true;
        public bool IsEducationPublic { get; set; } = true;
        public bool IsExperiencePublic { get; set; } = true;
        public bool IsSkillsPublic { get; set; } = true;
        public bool IsSocialMediaPublic { get; set; } = true;

        // Contact information fields
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int UserId { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public required User User { get; set; }

        // Collection navigation properties
        public required ICollection<Project> Projects { get; set; } = new List<Project>();
        public required ICollection<Education> Educations { get; set; } = new List<Education>();
        public required ICollection<Experience> Experiences { get; set; } = new List<Experience>();
        public required ICollection<Skill> Skills { get; set; } = new List<Skill>();
        public required ICollection<SocialMediaLink> SocialMediaLinks { get; set; } = new List<SocialMediaLink>();
    }
}