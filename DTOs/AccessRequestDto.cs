using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class AccessRequestDto
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public string PortfolioTitle { get; set; } = string.Empty;
        public int RequesterUserId { get; set; }
        public string RequesterName { get; set; } = string.Empty;
        public string RequesterEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string? OwnerResponseNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DecidedAt { get; set; }
    }
}