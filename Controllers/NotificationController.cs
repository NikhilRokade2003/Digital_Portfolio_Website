using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using DigitalPortfolioBackend.Data;

namespace DigitalPortfolioBackend.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class NotificationController : ControllerBase
	{
		private readonly AppDbContext _context;

		public NotificationController(AppDbContext context)
		{
			_context = context;
		}

		[Authorize]
		[HttpGet("debug")]
		public IActionResult DebugAuth()
		{
			try
			{
				var debugInfo = new
				{
					IsAuthenticated = User.Identity?.IsAuthenticated,
					AuthenticationType = User.Identity?.AuthenticationType,
					Name = User.Identity?.Name,
					Claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToArray(),
					UserId = GetCurrentUserId()
				};
				return Ok(debugInfo);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { Error = ex.Message, StackTrace = ex.StackTrace });
			}
		}

		[Authorize]
		[HttpGet("test-db")]
		public async Task<IActionResult> TestDatabase()
		{
			try
			{
				var userId = GetCurrentUserId();
				if (!userId.HasValue) return Unauthorized();

				// Test simple database query
				var count = await _context.Notifications.CountAsync();
				var userNotifications = await _context.Notifications
					.Where(n => n.UserId == userId.Value)
					.CountAsync();

				return Ok(new { 
					TotalNotifications = count, 
					UserNotifications = userNotifications,
					UserId = userId.Value
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { Error = ex.Message, StackTrace = ex.StackTrace });
			}
		}

		[Authorize]
		[HttpGet("my")]
		public async Task<IActionResult> GetMyNotifications()
		{
			try
			{
				var userId = GetCurrentUserId();
				Console.WriteLine($"GetMyNotifications - UserId: {userId}");
				
				if (!userId.HasValue) 
				{
					Console.WriteLine("GetMyNotifications - No userId found, returning Unauthorized");
					return Unauthorized();
				}

				Console.WriteLine($"GetMyNotifications - Querying notifications for user {userId.Value}");
				
				// Simplified query to avoid potential issues
				var list = await _context.Notifications
					.Where(n => n.UserId == userId.Value)
					.OrderByDescending(n => n.CreatedAt)
					.Take(100)
					.Select(n => new {
						n.Id,
						n.Type,
						n.Title,
						n.Message,
						n.IsRead,
						n.PortfolioId,
						n.AccessRequestId,
						n.CreatedAt
					})
					.ToListAsync();
				
				Console.WriteLine($"GetMyNotifications - Found {list.Count} notifications");
				return Ok(list);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"GetMyNotifications - Error: {ex.Message}");
				Console.WriteLine($"GetMyNotifications - StackTrace: {ex.StackTrace}");
				return StatusCode(500, new { Error = ex.Message, StackTrace = ex.StackTrace });
			}
		}

		[Authorize]
		[HttpPost("{id}/read")]
		public async Task<IActionResult> MarkRead(int id)
		{
			var userId = GetCurrentUserId();
			if (!userId.HasValue) return Unauthorized();

			var n = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId.Value);
			if (n == null) return NotFound();
			n.IsRead = true;
			await _context.SaveChangesAsync();
			return Ok();
		}

		[Authorize]
		[HttpPost("read-all")]
		public async Task<IActionResult> MarkAllRead()
		{
			var userId = GetCurrentUserId();
			if (!userId.HasValue) return Unauthorized();

			var list = await _context.Notifications.Where(n => n.UserId == userId.Value && !n.IsRead).ToListAsync();
			foreach (var n in list) n.IsRead = true;
			await _context.SaveChangesAsync();
			return Ok();
		}

		private int? GetCurrentUserId()
		{
			Console.WriteLine($"GetCurrentUserId - User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
			Console.WriteLine($"GetCurrentUserId - User.Identity.Name: {User.Identity?.Name}");
			
			// Debug: Print all claims
			Console.WriteLine("GetCurrentUserId - All claims:");
			foreach (var claim in User.Claims)
			{
				Console.WriteLine($"  {claim.Type}: {claim.Value}");
			}
			
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
				?? User.FindFirst("sub") 
				?? User.FindFirst("userId") 
				?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
			
			Console.WriteLine($"GetCurrentUserId - Found claim: {userIdClaim?.Type} = {userIdClaim?.Value}");
			
			if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId)) 
			{
				Console.WriteLine($"GetCurrentUserId - Parsed userId: {userId}");
				return userId;
			}
			
			Console.WriteLine("GetCurrentUserId - No valid userId found");
			return null;
		}
	}
}


