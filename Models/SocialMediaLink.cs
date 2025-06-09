using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
    public class SocialMediaLink
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Platform { get; set; }

        [Required]
        public required string Url { get; set; }

        [Required]
        [MaxLength(50)]
        public required string IconName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int PortfolioId { get; set; }

        // Navigation property
        [ForeignKey("PortfolioId")]
        public required Portfolio Portfolio { get; set; }
    }
}