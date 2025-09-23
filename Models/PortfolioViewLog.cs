using System;

namespace DigitalPortfolioBackend.Models
{
    public class PortfolioViewLog
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public Portfolio Portfolio { get; set; }
        public int? ViewerUserId { get; set; } // Nullable for anonymous views
        public User? Viewer { get; set; }
        public string? ViewerName { get; set; }
        public string? ViewerEmail { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
