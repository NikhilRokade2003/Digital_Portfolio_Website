using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DigitalPortfolioBackend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [JsonIgnore]
        public required string PasswordHash { get; set; }

        // Navigation property
        public required ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    }
}