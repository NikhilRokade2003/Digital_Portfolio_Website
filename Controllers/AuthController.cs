using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.DTOs;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            try
            {
                // Log the request data for debugging (excluding password)
                Console.WriteLine($"Registration attempt for email: {dto.Email}, name: {dto.FullName}");

                // Validate the model
                if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || 
                    string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
                {
                    Console.WriteLine("Invalid registration data: Missing required fields");
                    return BadRequest("Invalid registration data: Missing required fields");
                }

                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    Console.WriteLine($"Registration failed: Email {dto.Email} already in use");
                    return BadRequest("Email already in use");
                }

                // Create new user
                var user = new User 
                { 
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    FullName = dto.FullName,
                    Portfolios = new List<Portfolio>()
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"User created successfully with ID: {user.Id}");

                try
                {
                    // Sign the user in with a new session
                    await SignInUserAsync(user);
                    Console.WriteLine($"User {user.Id} signed in successfully");
                }
                catch (Exception signInEx)
                {
                    Console.WriteLine($"Error during sign-in: {signInEx.Message}");
                    // Continue even if sign-in fails, return success for the registration
                }
                
                Console.WriteLine($"Registration successful for user ID: {user.Id}, Email: {user.Email}");
                return Ok(new { message = "Registration successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Registration error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "An error occurred during registration. Please try again.");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            // Sign the user in with a new session
            await SignInUserAsync(user);
            
            Console.WriteLine($"Login successful for user ID: {user.Id}, Email: {user.Email}");
            return Ok(new { message = "Login successful" });
        }
        
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }
        
        [HttpGet("check-session")]
        public IActionResult CheckSession()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized();
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            
            return Ok(new { 
                isAuthenticated = true, 
                userId,
                email = userEmail
            });
        }
        
        private async Task SignInUserAsync(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("FullName", user.FullName ?? "")
            };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            var authProperties = new AuthenticationProperties
            {
                // Configure cookie expiration time
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(1),
                IsPersistent = true,
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
        }
    }
}
