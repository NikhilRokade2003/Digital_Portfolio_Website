using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Collections.Generic;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.DTOs;
using DigitalPortfolioBackend.Services;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortfolioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PDFGeneratorService _pdfService;
        private readonly ILogger<PortfolioController> _logger;

        public PortfolioController(AppDbContext context, PDFGeneratorService pdfService, ILogger<PortfolioController> logger)
        {
            _context = context;
            _pdfService = pdfService;
            _logger = logger;
        }

        // Get all portfolios
        [HttpGet("public")]
        public async Task<ActionResult<IEnumerable<PortfolioDto>>> GetPublicPortfolios()
        {
            var portfolios = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.SocialMediaLinks)
                .Include(p => p.Projects)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.Skills)
                .ToListAsync();

            var portfolioDtos = new List<PortfolioDto>();
            
            foreach (var p in portfolios)
            {
                var portfolioDto = new PortfolioDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ProfileImage = p.ProfileImage,
                    IsPublic = p.IsPublic,
                    // Include section visibility flags
                    IsProjectsPublic = p.IsProjectsPublic,
                    IsEducationPublic = p.IsEducationPublic,
                    IsExperiencePublic = p.IsExperiencePublic,
                    IsSkillsPublic = p.IsSkillsPublic,
                    IsSocialMediaPublic = p.IsSocialMediaPublic,
                    Email = p.Email,
                    Phone = p.Phone,
                    City = p.City,
                    Country = p.Country,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    UserId = p.UserId,
                    UserFullName = p.User?.FullName ?? "Unknown User",
                    Projects = new List<ProjectDto>(),
                    Educations = new List<EducationDto>(),
                    Experiences = new List<ExperienceDto>(),
                    Skills = new List<SkillDto>(),
                    SocialMediaLinks = new List<SocialMediaLinkDto>()
                };
                
                // Only include Projects if they're public
                if (p.IsProjectsPublic)
                {
                    portfolioDto.Projects = p.Projects.Select(proj => new ProjectDto
                    {
                        Id = proj.Id,
                        Title = proj.Title,
                        Description = proj.Description,
                        ImageUrl = proj.ImageUrl,
                        ProjectUrl = proj.ProjectUrl,
                        PortfolioId = proj.PortfolioId
                    }).ToList();
                }
                
                // Only include Education if it's public
                if (p.IsEducationPublic)
                {
                    portfolioDto.Educations = p.Educations.Select(e => new EducationDto
                    {
                        Id = e.Id,
                        Institution = e.Institution,
                        Degree = e.Degree,
                        Field = e.Field,
                        StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                        EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                        Description = e.Description,
                        PortfolioId = e.PortfolioId
                    }).ToList();
                }
                
                // Only include Experience if it's public
                if (p.IsExperiencePublic)
                {
                    portfolioDto.Experiences = p.Experiences.Select(e => new ExperienceDto
                    {
                        Id = e.Id,
                        Company = e.Company,
                        Position = e.Position,
                        Location = e.Location,
                        StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                        EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                        Description = e.Description,
                        PortfolioId = e.PortfolioId
                    }).ToList();
                }
                
                // Only include Skills if they're public
                if (p.IsSkillsPublic)
                {
                    portfolioDto.Skills = p.Skills.Select(s => new SkillDto
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Level = s.Level,
                        PortfolioId = s.PortfolioId
                    }).ToList();
                }
                
                // Only include Social Media links if they're public
                if (p.IsSocialMediaPublic)
                {
                    portfolioDto.SocialMediaLinks = p.SocialMediaLinks.Select(s => new SocialMediaLinkDto
                    {
                        Id = s.Id,
                        Platform = s.Platform,
                        Url = s.Url,
                        IconName = s.IconName,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt,
                        PortfolioId = s.PortfolioId
                    }).ToList();
                }
                
                portfolioDtos.Add(portfolioDto);
            }

            return Ok(portfolioDtos);
        }

        // Get a specific portfolio by ID (all portfolios are now public by default)
        [HttpGet("{id}")]
        public async Task<ActionResult<PortfolioDto>> GetPortfolio(int id)
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.Projects)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.Skills)
                .Include(p => p.SocialMediaLinks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Check if the user is the owner of this portfolio
            int? userId = GetCurrentUserId();
            bool isOwner = userId.HasValue && portfolio.UserId == userId.Value;
            
            // Create the DTO with basic information
            var portfolioDto = new PortfolioDto
            {
                Id = portfolio.Id,
                Title = portfolio.Title,
                Description = portfolio.Description,
                ProfileImage = portfolio.ProfileImage,
                IsPublic = portfolio.IsPublic,
                // Include section visibility flags
                IsProjectsPublic = portfolio.IsProjectsPublic,
                IsEducationPublic = portfolio.IsEducationPublic,
                IsExperiencePublic = portfolio.IsExperiencePublic,
                IsSkillsPublic = portfolio.IsSkillsPublic,
                IsSocialMediaPublic = portfolio.IsSocialMediaPublic,
                Email = portfolio.Email,
                Phone = portfolio.Phone,
                City = portfolio.City,
                Country = portfolio.Country,
                CreatedAt = portfolio.CreatedAt,
                UpdatedAt = portfolio.UpdatedAt,
                UserId = portfolio.UserId,
                UserFullName = portfolio.User?.FullName ?? "Unknown User",
                Projects = new List<ProjectDto>(),
                Educations = new List<EducationDto>(),
                Experiences = new List<ExperienceDto>(),
                Skills = new List<SkillDto>(),
                SocialMediaLinks = new List<SocialMediaLinkDto>()
            };

            // Only include Projects if they're public or if the user is the owner
            if (isOwner || portfolio.IsProjectsPublic)
            {
                portfolioDto.Projects = portfolio.Projects.Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    ProjectUrl = p.ProjectUrl,
                    PortfolioId = p.PortfolioId
                }).ToList();
            }

            // Only include Education if it's public or if the user is the owner
            if (isOwner || portfolio.IsEducationPublic)
            {
                portfolioDto.Educations = portfolio.Educations.Select(e => new EducationDto
                {
                    Id = e.Id,
                    Institution = e.Institution,
                    Degree = e.Degree,
                    Field = e.Field,
                    StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                    EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                    Description = e.Description,
                    PortfolioId = e.PortfolioId
                }).ToList();
            }

            // Only include Experience if it's public or if the user is the owner
            if (isOwner || portfolio.IsExperiencePublic)
            {
                portfolioDto.Experiences = portfolio.Experiences.Select(e => new ExperienceDto
                {
                    Id = e.Id,
                    Company = e.Company,
                    Position = e.Position,
                    Location = e.Location,
                    StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                    EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                    Description = e.Description,
                    PortfolioId = e.PortfolioId
                }).ToList();
            }

            // Only include Skills if they're public or if the user is the owner
            if (isOwner || portfolio.IsSkillsPublic)
            {
                portfolioDto.Skills = portfolio.Skills.Select(s => new SkillDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Level = s.Level,
                    PortfolioId = s.PortfolioId
                }).ToList();
            }

            // Only include Social Media links if they're public or if the user is the owner
            if (isOwner || portfolio.IsSocialMediaPublic)
            {
                portfolioDto.SocialMediaLinks = portfolio.SocialMediaLinks.Select(s => new SocialMediaLinkDto
                {
                    Id = s.Id,
                    Platform = s.Platform,
                    Url = s.Url,
                    IconName = s.IconName,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    PortfolioId = s.PortfolioId
                }).ToList();
            }

            return Ok(portfolioDto);
        }

        // Get all portfolios for current user
        [Authorize]
        [HttpGet("my-portfolios")]
        public async Task<ActionResult<IEnumerable<PortfolioDto>>> GetMyPortfolios()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var portfolios = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.SocialMediaLinks)
                .Where(p => p.UserId == userId.Value)
                .ToListAsync();

            return Ok(portfolios.Select(p => new PortfolioDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                ProfileImage = p.ProfileImage,
                IsPublic = p.IsPublic,
                // Include section visibility flags
                IsProjectsPublic = p.IsProjectsPublic,
                IsEducationPublic = p.IsEducationPublic,
                IsExperiencePublic = p.IsExperiencePublic,
                IsSkillsPublic = p.IsSkillsPublic,
                IsSocialMediaPublic = p.IsSocialMediaPublic,
                Email = p.Email,
                Phone = p.Phone,
                City = p.City,
                Country = p.Country,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                UserId = p.UserId,
                UserFullName = p.User?.FullName ?? "Unknown User",
                SocialMediaLinks = p.SocialMediaLinks.Select(s => new SocialMediaLinkDto
                {
                    Id = s.Id,
                    Platform = s.Platform,
                    Url = s.Url,
                    IconName = s.IconName,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    PortfolioId = s.PortfolioId
                }).ToList()
            }));
        }

        // Get all portfolios for the portfolio listing page
        [HttpGet("all-visible")]
        public async Task<ActionResult<IEnumerable<PortfolioDto>>> GetAllVisiblePortfolios()
        {
            var userId = GetCurrentUserId();
            
            // Get all portfolios
            var portfolios = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.SocialMediaLinks)
                .Include(p => p.Projects)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.Skills)
                .ToListAsync();

            var portfolioDtos = new List<PortfolioDto>();
            
            foreach (var p in portfolios)
            {
                var portfolioDto = new PortfolioDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ProfileImage = p.ProfileImage,
                    IsPublic = p.IsPublic,
                    // Include section visibility flags
                    IsProjectsPublic = p.IsProjectsPublic,
                    IsEducationPublic = p.IsEducationPublic,
                    IsExperiencePublic = p.IsExperiencePublic,
                    IsSkillsPublic = p.IsSkillsPublic,
                    IsSocialMediaPublic = p.IsSocialMediaPublic,
                    Email = p.Email,
                    Phone = p.Phone,
                    City = p.City,
                    Country = p.Country,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    UserId = p.UserId,
                    UserFullName = p.User?.FullName ?? "Unknown User",
                    Projects = new List<ProjectDto>(),
                    Educations = new List<EducationDto>(),
                    Experiences = new List<ExperienceDto>(),
                    Skills = new List<SkillDto>(),
                    SocialMediaLinks = new List<SocialMediaLinkDto>()
                };
                
                // Only include Projects if they're public
                if (p.IsProjectsPublic)
                {
                    portfolioDto.Projects = p.Projects.Select(proj => new ProjectDto
                    {
                        Id = proj.Id,
                        Title = proj.Title,
                        Description = proj.Description,
                        ImageUrl = proj.ImageUrl,
                        ProjectUrl = proj.ProjectUrl,
                        PortfolioId = proj.PortfolioId
                    }).ToList();
                }
                
                // Only include Education if it's public
                if (p.IsEducationPublic)
                {
                    portfolioDto.Educations = p.Educations.Select(e => new EducationDto
                    {
                        Id = e.Id,
                        Institution = e.Institution,
                        Degree = e.Degree,
                        Field = e.Field,
                        StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                        EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                        Description = e.Description,
                        PortfolioId = e.PortfolioId
                    }).ToList();
                }
                
                // Only include Experience if it's public
                if (p.IsExperiencePublic)
                {
                    portfolioDto.Experiences = p.Experiences.Select(e => new ExperienceDto
                    {
                        Id = e.Id,
                        Company = e.Company,
                        Position = e.Position,
                        Location = e.Location,
                        StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                        EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                        Description = e.Description,
                        PortfolioId = e.PortfolioId
                    }).ToList();
                }
                
                // Only include Skills if they're public
                if (p.IsSkillsPublic)
                {
                    portfolioDto.Skills = p.Skills.Select(s => new SkillDto
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Level = s.Level,
                        PortfolioId = s.PortfolioId
                    }).ToList();
                }
                
                // Only include Social Media links if they're public
                if (p.IsSocialMediaPublic)
                {
                    portfolioDto.SocialMediaLinks = p.SocialMediaLinks.Select(s => new SocialMediaLinkDto
                    {
                        Id = s.Id,
                        Platform = s.Platform,
                        Url = s.Url,
                        IconName = s.IconName,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt,
                        PortfolioId = s.PortfolioId
                    }).ToList();
                }
                
                portfolioDtos.Add(portfolioDto);
            }

            return Ok(portfolioDtos);
        }

        // Create a new portfolio
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PortfolioDto>> CreatePortfolio(CreatePortfolioDto dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }
            
            // Get the user for the navigation property
            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var portfolio = new Portfolio
            {
                Title = dto.Title,
                Description = dto.Description,
                ProfileImage = dto.ProfileImage,
                IsPublic = dto.IsPublic,
                // Section visibility flags
                IsProjectsPublic = dto.IsProjectsPublic,
                IsEducationPublic = dto.IsEducationPublic,
                IsExperiencePublic = dto.IsExperiencePublic,
                IsSkillsPublic = dto.IsSkillsPublic,
                IsSocialMediaPublic = dto.IsSocialMediaPublic,
                Email = dto.Email,
                Phone = dto.Phone,
                City = dto.City,
                Country = dto.Country,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                UserId = userId.Value,
                User = user,
                Projects = new List<Project>(),
                Educations = new List<Education>(),
                Experiences = new List<Experience>(),
                Skills = new List<Skill>(),
                SocialMediaLinks = new List<SocialMediaLink>()
            };

            // Add any social media links that were included in the DTO
            if (dto.SocialMediaLinks != null && dto.SocialMediaLinks.Any())
            {
                foreach (var linkDto in dto.SocialMediaLinks)
                {
                    portfolio.SocialMediaLinks.Add(new SocialMediaLink
                    {
                        Platform = linkDto.Platform,
                        Url = linkDto.Url,
                        IconName = linkDto.IconName,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Portfolio = portfolio
                    });
                }
            }

            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            // Map social media links to DTOs for the response
            var socialMediaLinkDtos = portfolio.SocialMediaLinks.Select(s => new SocialMediaLinkDto
            {
                Id = s.Id,
                Platform = s.Platform,
                Url = s.Url,
                IconName = s.IconName,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                PortfolioId = portfolio.Id
            }).ToList();

            return CreatedAtAction(nameof(GetPortfolio), new { id = portfolio.Id }, new PortfolioDto
            {
                Id = portfolio.Id,
                Title = portfolio.Title,
                Description = portfolio.Description,
                ProfileImage = portfolio.ProfileImage,
                IsPublic = portfolio.IsPublic,
                // Section visibility flags
                IsProjectsPublic = portfolio.IsProjectsPublic,
                IsEducationPublic = portfolio.IsEducationPublic,
                IsExperiencePublic = portfolio.IsExperiencePublic,
                IsSkillsPublic = portfolio.IsSkillsPublic,
                IsSocialMediaPublic = portfolio.IsSocialMediaPublic,
                Email = portfolio.Email,
                Phone = portfolio.Phone,
                City = portfolio.City,
                Country = portfolio.Country,
                CreatedAt = portfolio.CreatedAt,
                UpdatedAt = portfolio.UpdatedAt,
                UserId = portfolio.UserId,
                UserFullName = user.FullName,
                SocialMediaLinks = socialMediaLinkDtos
            });
        }

        // Update a portfolio
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePortfolio(int id, UpdatePortfolioDto dto)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var portfolio = await _context.Portfolios
                .Include(p => p.SocialMediaLinks)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            if (portfolio.UserId != userId)
            {
                return Forbid();
            }

            portfolio.Title = dto.Title;
            portfolio.Description = dto.Description;
            portfolio.ProfileImage = dto.ProfileImage;
            portfolio.IsPublic = dto.IsPublic;
            // Section visibility flags
            portfolio.IsProjectsPublic = dto.IsProjectsPublic;
            portfolio.IsEducationPublic = dto.IsEducationPublic;
            portfolio.IsExperiencePublic = dto.IsExperiencePublic;
            portfolio.IsSkillsPublic = dto.IsSkillsPublic;
            portfolio.IsSocialMediaPublic = dto.IsSocialMediaPublic;
            portfolio.Email = dto.Email;
            portfolio.Phone = dto.Phone;
            portfolio.City = dto.City;
            portfolio.Country = dto.Country;
            portfolio.UpdatedAt = DateTime.Now;

            // Handle social media links updates if provided
            if (dto.SocialMediaLinks != null && dto.SocialMediaLinks.Any())
            {
                // Remove existing social media links
                _context.SocialMediaLinks.RemoveRange(portfolio.SocialMediaLinks);

                // Add the updated social media links
                foreach (var linkDto in dto.SocialMediaLinks)
                {
                    portfolio.SocialMediaLinks.Add(new SocialMediaLink
                    {
                        Platform = linkDto.Platform,
                        Url = linkDto.Url,
                        IconName = linkDto.IconName,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        PortfolioId = portfolio.Id,
                        Portfolio = portfolio
                    });
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PortfolioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Delete a portfolio
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePortfolio(int id)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var portfolio = await _context.Portfolios.FindAsync(id);
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            if (portfolio.UserId != userId)
            {
                return Forbid();
            }

            _context.Portfolios.Remove(portfolio);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Download PDF version of portfolio - now returns HTML that auto-prompts print dialog
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPortfolioPDF(int id)
        {
            try
            {
                _logger.LogInformation($"Starting portfolio print view generation for ID: {id}");

                // Check if portfolio exists
                var portfolio = await _context.Portfolios
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (portfolio == null)
                {
                    _logger.LogWarning($"Portfolio not found for ID: {id}");
                    return NotFound("Portfolio not found");
                }

                try
                {
                    // Generate HTML with print capabilities
                    _logger.LogInformation($"Generating printable view for portfolio ID: {id}");
                    var htmlBytes = await _pdfService.GeneratePortfolioPDF(id);

                    if (htmlBytes == null || htmlBytes.Length == 0)
                    {
                        _logger.LogError($"Generated content has no data for portfolio ID: {id}");
                        return StatusCode(500, "Generated content has no data");
                    }

                    _logger.LogInformation($"Successfully generated printable content ({htmlBytes.Length} bytes) for portfolio ID: {id}");

                    // Return HTML content with a file name that indicates it's for printing
                    return File(htmlBytes, "text/html", $"portfolio-{id}-print-{DateTime.Now:yyyyMMdd}.html");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error generating printable view for portfolio ID: {id}. Error: {ex.Message}");
                    _logger.LogError($"Stack trace: {ex.StackTrace}");
                    return StatusCode(500, $"Error generating printable view: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error in DownloadPortfolioPDF: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "An unexpected error occurred while generating the printable view");
            }
        }

        // Get all social media links for a portfolio
        [HttpGet("{portfolioId}/social-media")]
        public async Task<ActionResult<IEnumerable<SocialMediaLinkDto>>> GetSocialMediaLinks(int portfolioId)
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.SocialMediaLinks)
                .FirstOrDefaultAsync(p => p.Id == portfolioId);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Check if the user is the owner or if section is public
            int? userId = GetCurrentUserId();
            bool isOwner = userId.HasValue && portfolio.UserId == userId.Value;
            
            // If social media links are private and the user is not the owner, forbid access
            if (!portfolio.IsSocialMediaPublic && !isOwner)
            {
                return Forbid();
            }

            return Ok(portfolio.SocialMediaLinks.Select(s => new SocialMediaLinkDto
            {
                Id = s.Id,
                Platform = s.Platform,
                Url = s.Url,
                IconName = s.IconName,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                PortfolioId = s.PortfolioId
            }));
        }

        // Get a specific social media link
        [HttpGet("{portfolioId}/social-media/{id}")]
        public async Task<ActionResult<SocialMediaLinkDto>> GetSocialMediaLink(int portfolioId, int id)
        {
            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Check if the user is the owner
            int? userId = GetCurrentUserId();
            bool isOwner = userId.HasValue && portfolio.UserId == userId.Value;
            
            // If social media section is private and user is not the owner, forbid access
            if (!portfolio.IsSocialMediaPublic && !isOwner)
            {
                return Forbid();
            }

            var socialMediaLink = await _context.SocialMediaLinks
                .FirstOrDefaultAsync(s => s.Id == id && s.PortfolioId == portfolioId);

            if (socialMediaLink == null)
            {
                return NotFound("Social media link not found");
            }

            return Ok(new SocialMediaLinkDto
            {
                Id = socialMediaLink.Id,
                Platform = socialMediaLink.Platform,
                Url = socialMediaLink.Url,
                IconName = socialMediaLink.IconName,
                CreatedAt = socialMediaLink.CreatedAt,
                UpdatedAt = socialMediaLink.UpdatedAt,
                PortfolioId = socialMediaLink.PortfolioId
            });
        }

        // Create a new social media link
        [Authorize]
        [HttpPost("{portfolioId}/social-media")]
        public async Task<ActionResult<SocialMediaLinkDto>> CreateSocialMediaLink(int portfolioId, CreateSocialMediaLinkDto dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId.Value);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found or you don't have permission to edit it");
            }

            var socialMediaLink = new SocialMediaLink
            {
                Platform = dto.Platform,
                Url = dto.Url,
                IconName = dto.IconName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PortfolioId = portfolioId,
                Portfolio = portfolio
            };

            _context.SocialMediaLinks.Add(socialMediaLink);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSocialMediaLink), 
                new { portfolioId = portfolioId, id = socialMediaLink.Id }, 
                new SocialMediaLinkDto
                {
                    Id = socialMediaLink.Id,
                    Platform = socialMediaLink.Platform,
                    Url = socialMediaLink.Url,
                    IconName = socialMediaLink.IconName,
                    CreatedAt = socialMediaLink.CreatedAt,
                    UpdatedAt = socialMediaLink.UpdatedAt,
                    PortfolioId = socialMediaLink.PortfolioId
                });
        }

        // Update a social media link
        [Authorize]
        [HttpPut("{portfolioId}/social-media/{id}")]
        public async Task<IActionResult> UpdateSocialMediaLink(int portfolioId, int id, UpdateSocialMediaLinkDto dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId.Value);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found or you don't have permission to edit it");
            }

            var socialMediaLink = await _context.SocialMediaLinks
                .FirstOrDefaultAsync(s => s.Id == id && s.PortfolioId == portfolioId);

            if (socialMediaLink == null)
            {
                return NotFound("Social media link not found");
            }

            socialMediaLink.Platform = dto.Platform;
            socialMediaLink.Url = dto.Url;
            socialMediaLink.IconName = dto.IconName;
            socialMediaLink.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SocialMediaLinkExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Delete a social media link
        [Authorize]
        [HttpDelete("{portfolioId}/social-media/{id}")]
        public async Task<IActionResult> DeleteSocialMediaLink(int portfolioId, int id)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId.Value);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found or you don't have permission to edit it");
            }

            var socialMediaLink = await _context.SocialMediaLinks
                .FirstOrDefaultAsync(s => s.Id == id && s.PortfolioId == portfolioId);

            if (socialMediaLink == null)
            {
                return NotFound("Social media link not found");
            }

            _context.SocialMediaLinks.Remove(socialMediaLink);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PortfolioExists(int id)
        {
            return _context.Portfolios.Any(e => e.Id == id);
        }

        private bool SocialMediaLinkExists(int id)
        {
            return _context.SocialMediaLinks.Any(e => e.Id == id);
        }

        private int? GetCurrentUserId()
        {
            Console.WriteLine("GetCurrentUserId called - starting claim extraction");
            
            // Try multiple claim types to find the user ID
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("sub") 
                ?? User.FindFirst("userId") 
                ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            
            // If we have a claim, try to parse it
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                Console.WriteLine($"Successfully extracted user ID: {userId} from claim type: {userIdClaim.Type}");
                return userId;
            }
            
            // Log all available claims for debugging
            Console.WriteLine("Failed to extract user ID. Available claims in token:");
            
            if (User.Claims.Any())
            {
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                }
            }
            else 
            {
                Console.WriteLine("NO CLAIMS FOUND IN THE TOKEN!");
            }
            
            Console.WriteLine($"User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
            
            // Check if the token is being properly sent from the frontend
            var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader))
            {
                Console.WriteLine("No Authorization header found in the request");
            }
            else
            {
                Console.WriteLine($"Authorization header found: {authHeader.Substring(0, Math.Min(20, authHeader.Length))}...");
            }
            
            return null;
        }
    }
}