using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
    public class Skill
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        [Range(1, 5)]
        public int Level { get; set; } = 3;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int PortfolioId { get; set; }

        // Navigation property
        [ForeignKey("PortfolioId")]
        public required Portfolio Portfolio { get; set; }
    }
}