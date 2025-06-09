using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class EducationDto
    {
        public int Id { get; set; }
        public required string Institution { get; set; }
        public required string Degree { get; set; }
        public required string Field { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
        public int PortfolioId { get; set; }
    }

    public class CreateEducationDto
    {
        public required string Institution { get; set; }
        public required string Degree { get; set; }
        public required string Field { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
    }

    public class UpdateEducationDto
    {
        public required string Institution { get; set; }
        public required string Degree { get; set; }
        public required string Field { get; set; }
        public required string StartDate { get; set; }
        public required string EndDate { get; set; }
        public required string Description { get; set; }
    }
}