using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
    public class Experience
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Company { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Position { get; set; }

        public required string Location { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public required string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int PortfolioId { get; set; }

        // Navigation property
        [ForeignKey("PortfolioId")]
        public required Portfolio Portfolio { get; set; }
    }
}