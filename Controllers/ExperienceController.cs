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

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperienceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExperienceController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Experience
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExperienceDto>>> GetExperiences()
        {
            var experiences = await _context.Experiences.ToListAsync();
            return Ok(experiences.Select(e => new ExperienceDto
            {
                Id = e.Id,
                Company = e.Company,
                Position = e.Position,
                Location = e.Location,
                StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = e.Description,
                PortfolioId = e.PortfolioId
            }));
        }

        // GET: api/Experience/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExperienceDto>> GetExperience(int id)
        {
            var experience = await _context.Experiences
                .Include(e => e.Portfolio)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                return NotFound("Experience not found");
            }

            // Check if the user has access to the portfolio
            if (!experience.Portfolio.IsPublic)
            {
                int? userId = GetCurrentUserId();
                if (userId == null || experience.Portfolio.UserId != userId.Value)
                {
                    return Forbid();
                }
            }

            return Ok(new ExperienceDto
            {
                Id = experience.Id,
                Company = experience.Company,
                Position = experience.Position,
                Location = experience.Location,
                StartDate = experience.StartDate.ToString("yyyy-MM-dd"),
                EndDate = experience.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = experience.Description,
                PortfolioId = experience.PortfolioId
            });
        }

        // GET: api/Experience/Portfolio/5
        [HttpGet("Portfolio/{portfolioId}")]
        public async Task<ActionResult<IEnumerable<ExperienceDto>>> GetExperiencesByPortfolioId(int portfolioId)
        {
            var portfolio = await _context.Portfolios.FindAsync(portfolioId);
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // If portfolio is private, check if user is authorized
            if (!portfolio.IsPublic)
            {
                int? userId = GetCurrentUserId();
                if (userId == null || portfolio.UserId != userId.Value)
                {
                    return Forbid();
                }
            }

            var experiences = await _context.Experiences
                .Where(e => e.PortfolioId == portfolioId)
                .ToListAsync();

            return Ok(experiences.Select(e => new ExperienceDto
            {
                Id = e.Id,
                Company = e.Company,
                Position = e.Position,
                Location = e.Location,
                StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = e.Description,
                PortfolioId = e.PortfolioId
            }));
        }

        // PUT: api/Experience/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExperience(int id, ExperienceDto dto)
        {
            int? userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var experience = await _context.Experiences
                .Include(e => e.Portfolio)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                return NotFound("Experience not found");
            }

            // Check if user owns the portfolio
            if (experience.Portfolio.UserId != userId.Value)
            {
                return Forbid();
            }

            // Update experience properties
            experience.Company = dto.Company;
            experience.Position = dto.Position;
            experience.Location = dto.Location;
            experience.StartDate = DateTime.Parse(dto.StartDate);
            experience.EndDate = string.IsNullOrEmpty(dto.EndDate) ? null : DateTime.Parse(dto.EndDate);
            experience.Description = dto.Description;
            experience.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Experience
        [Authorize]
        [HttpPost("portfolio/{portfolioId}")]
        public async Task<ActionResult<ExperienceDto>> AddExperience(int portfolioId, ExperienceDto dto)
        {
            int? userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Check if the portfolio exists and belongs to the current user
            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId.Value);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found or you don't have access to it");
            }

            var experience = new Experience
            {
                Company = dto.Company,
                Position = dto.Position,
                Location = dto.Location,
                StartDate = DateTime.Parse(dto.StartDate),
                EndDate = string.IsNullOrEmpty(dto.EndDate) ? null : DateTime.Parse(dto.EndDate),
                Description = dto.Description,
                PortfolioId = portfolioId,
                Portfolio = portfolio
            };

            _context.Experiences.Add(experience);
            await _context.SaveChangesAsync();

            dto.Id = experience.Id;
            return CreatedAtAction(nameof(GetExperience), new { id = experience.Id }, dto);
        }

        // DELETE: api/Experience/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExperience(int id)
        {
            int? userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var experience = await _context.Experiences
                .Include(e => e.Portfolio)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                return NotFound("Experience not found");
            }

            // Check if user owns the portfolio
            if (experience.Portfolio.UserId != userId.Value)
            {
                return Forbid();
            }

            _context.Experiences.Remove(experience);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExperienceExists(int id)
        {
            return _context.Experiences.Any(e => e.Id == id);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}