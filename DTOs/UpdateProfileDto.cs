using System.ComponentModel.DataAnnotations;

namespace DigitalPortfolioBackend.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [StringLength(100)]
        public required string FullName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public required string Email { get; set; }

        // Optional password fields
        public string? CurrentPassword { get; set; }

        [StringLength(100, MinimumLength = 6)]
        public string? NewPassword { get; set; }
    }
}