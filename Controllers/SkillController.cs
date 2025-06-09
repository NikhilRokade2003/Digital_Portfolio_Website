using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
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
    public class SkillController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SkillController(AppDbContext context)
        {
            _context = context;
        }

        // Get all skills for a portfolio
        [HttpGet("portfolio/{portfolioId}")]
        public async Task<ActionResult<IEnumerable<SkillDto>>> GetSkillsByPortfolio(int portfolioId)
        {
            // Check if the portfolio exists and if user has access
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

            var skills = await _context.Skills
                .Where(s => s.PortfolioId == portfolioId)
                .ToListAsync();

            return Ok(skills.Select(s => new SkillDto
            {
                Id = s.Id,
                Name = s.Name,
                Level = s.Level,
                PortfolioId = s.PortfolioId
            }));
        }

        // Get a specific skill by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<SkillDto>> GetSkill(int id)
        {
            var skill = await _context.Skills
                .Include(s => s.Portfolio)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return NotFound("Skill not found");
            }

            // Check if the user has access to the portfolio
            if (!skill.Portfolio.IsPublic)
            {
                int? userId = GetCurrentUserId();
                if (userId == null || skill.Portfolio.UserId != userId.Value)
                {
                    return Forbid();
                }
            }

            return Ok(new SkillDto
            {
                Id = skill.Id,
                Name = skill.Name,
                Level = skill.Level,
                PortfolioId = skill.PortfolioId
            });
        }

        // Add a skill to a portfolio
        [Authorize]
        [HttpPost("portfolio/{portfolioId}")]
        public async Task<ActionResult<SkillDto>> AddSkill(int portfolioId, CreateSkillDto dto)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            // Check if the portfolio exists and belongs to the current user
            var portfolio = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);

            if (portfolio == null)
            {
                return NotFound("Portfolio not found or you don't have access to it");
            }

            var skill = new Skill
            {
                Name = dto.Name,
                Level = dto.Level,
                PortfolioId = portfolioId,
                Portfolio = portfolio
            };

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            var skillDto = new SkillDto
            {
                Id = skill.Id,
                Name = skill.Name,
                Level = skill.Level,
                PortfolioId = skill.PortfolioId
            };

            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skillDto);
        }

        // Update a skill
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSkill(int id, UpdateSkillDto dto)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var skill = await _context.Skills
                .Include(s => s.Portfolio)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return NotFound("Skill not found");
            }

            // Check if user owns the portfolio
            if (skill.Portfolio.UserId != userId)
            {
                return Forbid();
            }

            // Update skill properties
            skill.Name = dto.Name;
            skill.Level = dto.Level;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete a skill
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var skill = await _context.Skills
                .Include(s => s.Portfolio)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return NotFound("Skill not found");
            }

            // Check if user owns the portfolio
            if (skill.Portfolio.UserId != userId)
            {
                return Forbid();
            }

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();

            return NoContent();
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