using System.Collections.Generic;

namespace DigitalPortfolioBackend.Models
{
    public class PortfolioCreationState
    {
        public string CurrentStep { get; set; } // e.g., "portfolio_details", "projects", "education", etc.
        public PortfolioData PortfolioData { get; set; } = new PortfolioData();
        public bool IsComplete { get; set; }
    }

    public class PortfolioData
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ProfileImage { get; set; }
        public bool IsPublic { get; set; }
        public bool IsProjectsPublic { get; set; } = true;
        public bool IsEducationPublic { get; set; } = true;
        public bool IsExperiencePublic { get; set; } = true;
        public bool IsSkillsPublic { get; set; } = true;
        public bool IsSocialMediaPublic { get; set; } = true;
        public string Email { get; set; }
        public string Phone { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public List<ProjectData> Projects { get; set; } = new List<ProjectData>();
        public List<EducationData> Educations { get; set; } = new List<EducationData>();
        public List<ExperienceData> Experiences { get; set; } = new List<ExperienceData>();
        public List<SkillData> Skills { get; set; } = new List<SkillData>();
        public List<SocialMediaData> SocialMediaLinks { get; set; } = new List<SocialMediaData>();
    }

    public class ProjectData
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string ProjectUrl { get; set; }
    }

    public class EducationData
    {
        public string Institution { get; set; }
        public string Degree { get; set; }
        public string Field { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Description { get; set; }
    }

    public class ExperienceData
    {
        public string Company { get; set; }
        public string Position { get; set; }
        public string Location { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Description { get; set; }
    }

    public class SkillData
    {
        public string Name { get; set; }
        public int Level { get; set; }
    }

    public class SocialMediaData
    {
        public string Platform { get; set; }
        public string Url { get; set; }
        public string IconName { get; set; }
    }
}
