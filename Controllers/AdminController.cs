using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.DTOs;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AdminController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        private bool AdminPinValid()
        {
            var pin = Request.Headers["X-Admin-Pin"].FirstOrDefault();
            var cfg = _config["Admin:Pin"];
            return !string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(cfg) && pin == cfg;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.FullName, u.Email, u.Role })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("portfolios")]
        public async Task<IActionResult> GetAllPortfolios()
        {
            var portfolios = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.Projects)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.Skills)
                .Include(p => p.SocialMediaLinks)
                .ToListAsync();

            var dtos = portfolios.Select(p => new PortfolioDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                ProfileImage = p.ProfileImage,
                IsPublic = p.IsPublic,
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
                UserFullName = p.User.FullName,
                Projects = p.Projects.Select(x => new ProjectDto { Id = x.Id, Title = x.Title, Description = x.Description, ImageUrl = x.ImageUrl, ProjectUrl = x.ProjectUrl, PortfolioId = x.PortfolioId }).ToList(),
                Educations = p.Educations.Select(x => new EducationDto { Id = x.Id, Institution = x.Institution, Degree = x.Degree, Field = x.Field, StartDate = x.StartDate.ToString("yyyy-MM-dd"), EndDate = x.EndDate?.ToString("yyyy-MM-dd") ?? "", Description = x.Description, PortfolioId = x.PortfolioId }).ToList(),
                Experiences = p.Experiences.Select(x => new ExperienceDto { Id = x.Id, Company = x.Company, Position = x.Position, Location = x.Location, StartDate = x.StartDate.ToString("yyyy-MM-dd"), EndDate = x.EndDate?.ToString("yyyy-MM-dd") ?? "", Description = x.Description, PortfolioId = x.PortfolioId }).ToList(),
                Skills = p.Skills.Select(x => new SkillDto { Id = x.Id, Name = x.Name, Level = x.Level, PortfolioId = x.PortfolioId }).ToList(),
                SocialMediaLinks = p.SocialMediaLinks.Select(x => new SocialMediaLinkDto { Id = x.Id, Platform = x.Platform, Url = x.Url, IconName = x.IconName, CreatedAt = x.CreatedAt, UpdatedAt = x.UpdatedAt, PortfolioId = x.PortfolioId }).ToList()
            });
            return Ok(dtos);
        }

        [HttpGet("portfolios/{id}/full")]
        public async Task<IActionResult> GetPortfolioFull(int id)
        {
            var p = await _context.Portfolios
                .Include(p => p.User)
                .Include(p => p.Projects)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.Skills)
                .Include(p => p.SocialMediaLinks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return NotFound();

            return Ok(new
            {
                user = new { p.User.Id, p.User.FullName, p.User.Email, p.User.Role },
                portfolio = new
                {
                    p.Id, p.Title, p.Description, p.ProfileImage, p.Email, p.Phone, p.City, p.Country,
                    p.IsPublic, p.CreatedAt, p.UpdatedAt,
                    projects = p.Projects,
                    educations = p.Educations,
                    experiences = p.Experiences,
                    skills = p.Skills,
                    socialMediaLinks = p.SocialMediaLinks
                }
            });
        }

        [HttpGet("portfolios/{id}/analytics")]
        public async Task<IActionResult> GetPortfolioAnalytics(int id)
        {
            var p = await _context.Portfolios
                .Include(p => p.Projects)
                .Include(p => p.Skills)
                .Include(p => p.Experiences)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return NotFound();

            var projectsByYear = p.Projects
                .GroupBy(x => x.CreatedAt.Year)
                .Select(g => new { year = g.Key, count = g.Count() })
                .OrderBy(x => x.year)
                .ToList();

            var skillsByLevel = p.Skills
                .GroupBy(x => x.Level)
                .Select(g => new { level = g.Key.ToString(), count = g.Count() })
                .ToList();

            var experienceMonths = p.Experiences.Select(e =>
            {
                var end = e.EndDate ?? System.DateTime.UtcNow;
                var months = ((end.Year - e.StartDate.Year) * 12) + end.Month - e.StartDate.Month;
                return new { e.Company, e.Position, months = System.Math.Max(months, 0) };
            }).ToList();

            return Ok(new { projectsByYear, skillsByLevel, experienceMonths });
        }

        [HttpDelete("portfolios/{id}")]
        public async Task<IActionResult> DeletePortfolioAsAdmin(int id)
        {
            var portfolio = await _context.Portfolios.FindAsync(id);
            if (portfolio == null) return NotFound();
            _context.Portfolios.Remove(portfolio);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("users/{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            if (!AdminPinValid()) return Forbid();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var temp = $"Temp{System.Guid.NewGuid().ToString("N")[..8]}!";
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(temp);
            await _context.SaveChangesAsync();

            return Ok(new { temporaryPassword = temp });
        }
    }
}


