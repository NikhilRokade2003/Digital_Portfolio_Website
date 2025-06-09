using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace DigitalPortfolioBackend.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // With cookie-based authentication, we don't need to do anything special here
            // The built-in ASP.NET Core authentication middleware will handle session validation
            // This middleware can be used for additional custom authentication logic if needed

            // For debugging purposes, log authentication status
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                System.Console.WriteLine($"Request from authenticated user: {userId} for path: {context.Request.Path}");
            }
            else
            {
                System.Console.WriteLine($"Request from unauthenticated user for path: {context.Request.Path}");
            }

            await _next(context);
        }
    }

    // Extension method for middleware registration
    public static class AuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthMiddleware>();
        }
    }
}