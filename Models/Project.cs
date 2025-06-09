using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Title { get; set; }

        public required string Description { get; set; }

        public required string ImageUrl { get; set; }

        public required string ProjectUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int PortfolioId { get; set; }

        // Navigation property
        [ForeignKey("PortfolioId")]
        public required Portfolio Portfolio { get; set; }
    }
}