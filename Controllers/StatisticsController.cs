using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalPortfolioBackend.Data;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                // Get total users count
                var totalUsers = await _context.Users.CountAsync();
                
                // Get total portfolios count
                var totalPortfolios = await _context.Portfolios.CountAsync();
                
                // Get active users (users who have created at least one portfolio)
                var activeUsers = await _context.Users
                    .Where(u => _context.Portfolios.Any(p => p.UserId == u.Id))
                    .CountAsync();

                // Calculate some additional statistics
                var portfoliosThisMonth = await _context.Portfolios
                    .Where(p => p.CreatedAt >= DateTime.UtcNow.AddMonths(-1))
                    .CountAsync();

                // Format numbers for display
                string FormatNumber(int number)
                {
                    if (number >= 1000000)
                        return $"{number / 1000000.0:F1}M";
                    if (number >= 1000)
                        return $"{number / 1000.0:F1}K";
                    return number.ToString();
                }

                var statistics = new
                {
                    totalUsers = totalUsers,
                    totalPortfolios = totalPortfolios,
                    activeUsers = activeUsers,
                    portfoliosThisMonth = portfoliosThisMonth,
                    formattedStats = new
                    {
                        users = totalUsers > 0 ? FormatNumber(totalUsers) : "0",
                        portfolios = totalPortfolios > 0 ? FormatNumber(totalPortfolios) : "0",
                        activeUsers = activeUsers > 0 ? FormatNumber(activeUsers) : "0"
                    },
                    uptime = "99.9%", // This could be calculated from server monitoring
                    support = "24/7"   // Static value for now
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStatistics()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalPortfolios = await _context.Portfolios.CountAsync();
                var totalAccessRequests = await _context.AccessRequests.CountAsync();
                var totalNotifications = await _context.Notifications.CountAsync();

                // Recent activity
                var recentUsers = await _context.Users
                    .OrderByDescending(u => u.Id) // Use Id as proxy for creation order
                    .Take(5)
                    .Select(u => new { u.FullName, u.Email })
                    .ToListAsync();

                var recentPortfolios = await _context.Portfolios
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(5)
                    .Select(p => new { p.Title, p.CreatedAt })
                    .ToListAsync();

                return Ok(new
                {
                    totalUsers,
                    totalPortfolios,
                    totalAccessRequests,
                    totalNotifications,
                    recentUsers,
                    recentPortfolios
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching dashboard statistics", error = ex.Message });
            }
        }
    }
}