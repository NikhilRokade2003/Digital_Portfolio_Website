using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.DTOs;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EducationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EducationController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Education
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EducationDto>>> GetEducations()
        {
            var educations = await _context.Educations.ToListAsync();
            return Ok(educations.Select(e => new EducationDto
            {
                Id = e.Id,
                Institution = e.Institution,
                Degree = e.Degree,
                Field = e.Field,
                StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = e.Description,
                PortfolioId = e.PortfolioId
            }));
        }

        // GET: api/Education/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EducationDto>> GetEducation(int id)
        {
            var education = await _context.Educations.FindAsync(id);

            if (education == null)
            {
                return NotFound();
            }

            var educationDto = new EducationDto
            {
                Id = education.Id,
                Institution = education.Institution,
                Degree = education.Degree,
                Field = education.Field,
                StartDate = education.StartDate.ToString("yyyy-MM-dd"),
                EndDate = education.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = education.Description,
                PortfolioId = education.PortfolioId
            };

            return educationDto;
        }

        // GET: api/Education/Portfolio/5
        [HttpGet("Portfolio/{portfolioId}")]
        public async Task<ActionResult<IEnumerable<EducationDto>>> GetEducationsByPortfolioId(int portfolioId)
        {
            var educations = await _context.Educations
                .Where(e => e.PortfolioId == portfolioId)
                .ToListAsync();

            return Ok(educations.Select(e => new EducationDto
            {
                Id = e.Id,
                Institution = e.Institution,
                Degree = e.Degree,
                Field = e.Field,
                StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                EndDate = e.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = e.Description,
                PortfolioId = e.PortfolioId
            }));
        }

        // PUT: api/Education/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEducation(int id, EducationDto educationDto)
        {
            if (id != educationDto.Id)
            {
                return BadRequest();
            }

            var education = await _context.Educations.FindAsync(id);
            if (education == null)
            {
                return NotFound();
            }

            // Check if the user owns the portfolio
            var portfolio = await _context.Portfolios.FindAsync(education.PortfolioId);
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Get current user ID
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            int userId = userIdResult.Value;

            if (portfolio.UserId != userId)
            {
                return Forbid();
            }

            education.Institution = educationDto.Institution;
            education.Degree = educationDto.Degree;
            education.Field = educationDto.Field;
            education.StartDate = DateTime.Parse(educationDto.StartDate);
            education.EndDate = string.IsNullOrEmpty(educationDto.EndDate) ? null : DateTime.Parse(educationDto.EndDate);
            education.Description = educationDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EducationExists(id))
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

        // POST: api/Education
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<EducationDto>> PostEducation(EducationDto educationDto)
        {
            // Check if the portfolio exists
            var portfolio = await _context.Portfolios.FindAsync(educationDto.PortfolioId);
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Get current user ID
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            int userId = userIdResult.Value;

            if (portfolio.UserId != userId)
            {
                return Forbid();
            }

            var education = new Education
            {
                Institution = educationDto.Institution,
                Degree = educationDto.Degree,
                Field = educationDto.Field,
                StartDate = DateTime.Parse(educationDto.StartDate),
                EndDate = string.IsNullOrEmpty(educationDto.EndDate) ? null : DateTime.Parse(educationDto.EndDate),
                Description = educationDto.Description,
                PortfolioId = educationDto.PortfolioId,
                Portfolio = portfolio
            };

            _context.Educations.Add(education);
            await _context.SaveChangesAsync();

            educationDto.Id = education.Id;

            return CreatedAtAction("GetEducation", new { id = education.Id }, educationDto);
        }

        // POST: api/Education/portfolio/{portfolioId}
        [Authorize]
        [HttpPost("portfolio/{portfolioId}")]
        public async Task<ActionResult<EducationDto>> AddEducation(int portfolioId, CreateEducationDto dto)
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

            var education = new Education
            {
                Institution = dto.Institution,
                Degree = dto.Degree,
                Field = dto.Field,
                StartDate = DateTime.Parse(dto.StartDate),
                EndDate = string.IsNullOrEmpty(dto.EndDate) ? null : DateTime.Parse(dto.EndDate),
                Description = dto.Description,
                PortfolioId = portfolioId,
                Portfolio = portfolio
            };

            _context.Educations.Add(education);
            await _context.SaveChangesAsync();

            var educationDto = new EducationDto
            {
                Id = education.Id,
                Institution = education.Institution,
                Degree = education.Degree,
                Field = education.Field,
                StartDate = education.StartDate.ToString("yyyy-MM-dd"),
                EndDate = education.EndDate?.ToString("yyyy-MM-dd") ?? "",
                Description = education.Description,
                PortfolioId = education.PortfolioId
            };

            return CreatedAtAction(nameof(GetEducation), new { id = education.Id }, educationDto);
        }

        // DELETE: api/Education/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEducation(int id)
        {
            var education = await _context.Educations.FindAsync(id);
            if (education == null)
            {
                return NotFound();
            }

            // Check if the user owns the portfolio
            var portfolio = await _context.Portfolios.FindAsync(education.PortfolioId);
            if (portfolio == null)
            {
                return NotFound("Portfolio not found");
            }

            // Get current user ID
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            int userId = userIdResult.Value;

            if (portfolio.UserId != userId)
            {
                return Forbid();
            }

            _context.Educations.Remove(education);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EducationExists(int id)
        {
            return _context.Educations.Any(e => e.Id == id);
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