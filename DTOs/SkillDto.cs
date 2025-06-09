using System;

namespace DigitalPortfolioBackend.DTOs
{
    public class SkillDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int Level { get; set; }
        public int PortfolioId { get; set; }
    }

    public class CreateSkillDto
    {
        public required string Name { get; set; }
        public int Level { get; set; }
    }

    public class UpdateSkillDto
    {
        public required string Name { get; set; }
        public int Level { get; set; }
    }
}