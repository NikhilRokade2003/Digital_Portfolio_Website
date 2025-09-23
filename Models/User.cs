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
        public string PasswordHash { get; set; } = string.Empty;

        // Role: "User" or "Admin"
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "User";

        // Navigation property
        public required ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    }
}