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
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        // Get all projects for a portfolio
        [HttpGet("portfolio/{portfolioId}")]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjectsByPortfolio(int portfolioId)
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

            var projects = await _context.Projects
                .Where(p => p.PortfolioId == portfolioId)
                .ToListAsync();

            return Ok(projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                ProjectUrl = p.ProjectUrl,
                PortfolioId = p.PortfolioId
            }));
        }

        // Get a specific project by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Portfolio)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound("Project not found");
            }

            // Check if the user has access to the portfolio
            if (!project.Portfolio.IsPublic)
            {
                int? userId = GetCurrentUserId();
                if (userId == null || project.Portfolio.UserId != userId.Value)
                {
                    return Forbid();
                }
            }

            return Ok(new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                ImageUrl = project.ImageUrl,
                ProjectUrl = project.ProjectUrl,
                PortfolioId = project.PortfolioId
            });
        }

        // Add a project to a portfolio
        [Authorize]
        [HttpPost("portfolio/{portfolioId}")]
        public async Task<ActionResult<ProjectDto>> AddProject(int portfolioId, CreateProjectDto dto)
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

            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                ProjectUrl = dto.ProjectUrl,
                PortfolioId = portfolioId,
                Portfolio = portfolio
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                ImageUrl = project.ImageUrl,
                ProjectUrl = project.ProjectUrl,
                PortfolioId = project.PortfolioId
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, projectDto);
        }

        // Update a project
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, UpdateProjectDto dto)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var project = await _context.Projects
                .Include(p => p.Portfolio)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound("Project not found");
            }

            // Check if user owns the portfolio
            if (project.Portfolio.UserId != userId)
            {
                return Forbid();
            }

            // Update project properties
            project.Title = dto.Title;
            project.Description = dto.Description;
            project.ImageUrl = dto.ImageUrl;
            project.ProjectUrl = dto.ProjectUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete a project
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userIdResult = GetCurrentUserId();
            if (!userIdResult.HasValue)
            {
                return Unauthorized();
            }
            
            var userId = userIdResult.Value;

            var project = await _context.Projects
                .Include(p => p.Portfolio)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound("Project not found");
            }

            // Check if user owns the portfolio
            if (project.Portfolio.UserId != userId)
            {
                return Forbid();
            }

            _context.Projects.Remove(project);
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