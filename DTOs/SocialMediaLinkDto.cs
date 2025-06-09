using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class SocialMediaLinkDto
    {
        public int Id { get; set; }
        public string Platform { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int PortfolioId { get; set; }
    }

    public class CreateSocialMediaLinkDto
    {
        public string Platform { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
    }

    public class UpdateSocialMediaLinkDto
    {
        public string Platform { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
    }
}