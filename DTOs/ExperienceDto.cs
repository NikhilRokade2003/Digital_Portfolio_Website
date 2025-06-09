using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class ExperienceDto
    {
        public int Id { get; set; }
        public required string Company { get; set; }
        public required string Position { get; set; }
        public required string Location { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
        public int PortfolioId { get; set; }
    }

    public class CreateExperienceDto
    {
        public required string Company { get; set; }
        public required string Position { get; set; }
        public required string Location { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
    }

    public class UpdateExperienceDto
    {
        public required string Company { get; set; }
        public required string Position { get; set; }
        public required string Location { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
    }
}