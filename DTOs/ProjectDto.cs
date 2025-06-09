using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public required string ProjectUrl { get; set; }
        public int PortfolioId { get; set; }
    }

    public class CreateProjectDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public required string ProjectUrl { get; set; }
    }

    public class UpdateProjectDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public required string ProjectUrl { get; set; }
    }
}