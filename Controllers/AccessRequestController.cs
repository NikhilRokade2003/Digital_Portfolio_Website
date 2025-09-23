using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.DTOs;
using DigitalPortfolioBackend.Services;
using System.Security.Claims;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccessRequestController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly ILogger<AccessRequestController> _logger;

        public AccessRequestController(AppDbContext context, EmailService emailService, ILogger<AccessRequestController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpPost("portfolio/{portfolioId}")]
        public async Task<IActionResult> RequestAccess(int portfolioId, [FromBody] AccessRequestDto request)
        {
            try
            {
                _logger.LogInformation("Access request started for portfolio {PortfolioId}", portfolioId);
                
                var requesterId = GetCurrentUserId();
                if (requesterId == 0)
                {
                    _logger.LogWarning("Access request failed: User not authenticated");
                    return Unauthorized("User not authenticated");
                }

                _logger.LogInformation("Requester ID: {RequesterId}", requesterId);

                var portfolio = await _context.Portfolios.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == portfolioId);
                if (portfolio == null)
                {
                    _logger.LogWarning("Access request failed: Portfolio {PortfolioId} not found", portfolioId);
                    return NotFound("Portfolio not found");
                }

                _logger.LogInformation("Portfolio found: {PortfolioTitle}, Owner: {OwnerName} (ID: {OwnerId})", 
                    portfolio.Title, portfolio.User.FullName, portfolio.UserId);

                var existingRequest = await _context.AccessRequests.FirstOrDefaultAsync(ar => ar.PortfolioId == portfolioId && ar.RequesterUserId == requesterId);
                if (existingRequest != null)
                {
                    _logger.LogWarning("Access request failed: Request already exists for portfolio {PortfolioId} from user {RequesterId}", 
                        portfolioId, requesterId);
                    return BadRequest("Access request already exists");
                }

                _logger.LogInformation("No existing request found, creating new access request");

                var requester = await _context.Users.FindAsync(requesterId);
                var accessRequest = new AccessRequest
                {
                    PortfolioId = portfolioId,
                    RequesterUserId = requesterId,
                    Portfolio = portfolio,
                    Requester = requester!,
                    Message = request.Message ?? "",
                    Status = AccessRequestStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AccessRequests.Add(accessRequest);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Access request saved with ID: {AccessRequestId}", accessRequest.Id);

                // Create notification for the portfolio owner
                var notification = new Notification
                {
                    UserId = portfolio.UserId, // Portfolio owner receives the notification
                    User = portfolio.User,
                    Type = NotificationType.AccessRequested,
                    Title = "New Access Request",
                    Message = $"{requester!.FullName} has requested access to your portfolio '{portfolio.Title}'" +
                             (string.IsNullOrEmpty(request.Message) ? "" : $": {request.Message}"),
                    PortfolioId = portfolioId,
                    AccessRequestId = accessRequest.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Notification created for user {UserId} with ID: {NotificationId}", 
                    portfolio.UserId, notification.Id);

                // Send email notification
                await _emailService.SendAccessRequestNotificationAsync(
                    portfolio.User.Email,
                    portfolio.User.FullName,
                    requester.FullName,
                    portfolio.Title,
                    request.Message ?? ""
                );
                
                _logger.LogInformation("Email notification sent to {Email}", portfolio.User.Email);

                return Ok(new { message = "Access request sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating access request for portfolio {PortfolioId}", portfolioId);
                return StatusCode(500, new { error = "Failed to send access request" });
            }
        }

        [HttpGet("debug/{portfolioId}")]
        [AllowAnonymous] // Temporarily allow anonymous access for debugging
        public async Task<IActionResult> DebugPortfolioData(int portfolioId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                _logger.LogInformation("DEBUG: Current user ID: {CurrentUserId}", currentUserId);

                // Check portfolio
                var portfolio = await _context.Portfolios
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == portfolioId);

                var portfolioInfo = portfolio != null 
                    ? new { 
                        Id = portfolio.Id, 
                        Title = portfolio.Title, 
                        OwnerId = portfolio.UserId, 
                        OwnerName = portfolio.User?.FullName,
                        IsPrivate = !portfolio.IsPublic 
                    }
                    : null;

                // Check existing access requests from current user to this portfolio
                var existingRequests = await _context.AccessRequests
                    .Where(ar => ar.RequesterUserId == currentUserId && ar.PortfolioId == portfolioId)
                    .Select(ar => new { ar.Id, ar.Status, ar.CreatedAt })
                    .ToListAsync();

                // Check notifications for portfolio owner
                object ownerNotifications = portfolio != null ? await _context.Notifications
                    .Where(n => n.UserId == portfolio.UserId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(5)
                    .Select(n => new { n.Id, n.Type, n.Message, n.CreatedAt, n.IsRead })
                    .ToListAsync() : new List<object>();

                return Ok(new
                {
                    CurrentUserId = currentUserId,
                    Portfolio = portfolioInfo,
                    ExistingRequests = existingRequests,
                    OwnerNotifications = ownerNotifications
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in debug endpoint for portfolio {PortfolioId}", portfolioId);
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
