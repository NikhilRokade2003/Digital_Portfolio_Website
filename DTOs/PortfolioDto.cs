using System;
using System.Collections.Generic;

namespace DigitalPortfolioBackend.DTOs
{
    public class PortfolioDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ProfileImage { get; set; }
        public bool IsPublic { get; set; }
        // Section visibility flags
        public bool IsProjectsPublic { get; set; }
        public bool IsEducationPublic { get; set; }
        public bool IsExperiencePublic { get; set; }
        public bool IsSkillsPublic { get; set; }
        public bool IsSocialMediaPublic { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
        public required string UserFullName { get; set; }
        
        public List<ProjectDto> Projects { get; set; } = new List<ProjectDto>();
        public List<EducationDto> Educations { get; set; } = new List<EducationDto>();
        public List<ExperienceDto> Experiences { get; set; } = new List<ExperienceDto>();
        public List<SkillDto> Skills { get; set; } = new List<SkillDto>();
        public List<SocialMediaLinkDto> SocialMediaLinks { get; set; } = new List<SocialMediaLinkDto>();
    }

    public class CreatePortfolioDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ProfileImage { get; set; }
        public bool IsPublic { get; set; }
        // Section visibility flags
        public bool IsProjectsPublic { get; set; } = true;
        public bool IsEducationPublic { get; set; } = true;
        public bool IsExperiencePublic { get; set; } = true;
        public bool IsSkillsPublic { get; set; } = true;
        public bool IsSocialMediaPublic { get; set; } = true;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public List<CreateSocialMediaLinkDto> SocialMediaLinks { get; set; } = new List<CreateSocialMediaLinkDto>();
    }

    public class UpdatePortfolioDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string ProfileImage { get; set; }
        public bool IsPublic { get; set; }
        // Section visibility flags
        public bool IsProjectsPublic { get; set; }
        public bool IsEducationPublic { get; set; }
        public bool IsExperiencePublic { get; set; }
        public bool IsSkillsPublic { get; set; }
        public bool IsSocialMediaPublic { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public List<UpdateSocialMediaLinkDto> SocialMediaLinks { get; set; } = new List<UpdateSocialMediaLinkDto>();
    }
}