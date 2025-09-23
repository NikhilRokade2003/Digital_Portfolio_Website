using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.DTOs;
using DigitalPortfolioBackend.Services;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext context, IConfiguration config, EmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                var email = dto?.Email?.Trim();
                if (string.IsNullOrWhiteSpace(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                // Optional: check if user exists silently
                var userExists = await _context.Users.AnyAsync(u => u.Email == email);

                // Read admin contact from config
                var adminName = _config["Admin:Contact:Name"] ?? "Administrator";
                var adminEmail = _config["Admin:Contact:Email"] ?? "admin@example.com";
                var adminPhone = _config["Admin:Contact:Phone"] ?? string.Empty;

                // Fire-and-forget: send an email with admin contact
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendForgotPasswordContactAdminAsync(email, adminName, adminEmail, adminPhone);
                    }
                    catch (Exception mailEx)
                    {
                        Console.WriteLine($"Failed to send forgot-password email: {mailEx.Message}");
                    }
                });

                // Always return success for privacy
                return Ok(new
                {
                    message = "Kindly contact admin for password assistance.",
                    admin = new { name = adminName, email = adminEmail, phone = adminPhone },
                    sent = userExists
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Forgot password error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred. Please try again." });
            }
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

                // Fire-and-forget email send (do not block response)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendRegistrationConfirmationAsync(user.Email, user.FullName);
                        Console.WriteLine($"Confirmation email sent to {user.Email}");
                    }
                    catch (Exception mailEx)
                    {
                        Console.WriteLine($"Failed to send confirmation email: {mailEx.Message}");
                    }
                });
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

        // Promote a user to Admin using a secret PIN (sent via header X-Admin-Pin)
        [HttpPost("promote")]
        public async Task<IActionResult> PromoteToAdmin([FromQuery] string email)
        {
            var pinHeader = Request.Headers["X-Admin-Pin"].ToString();
            var requiredPin = _config["Admin:Pin"];
            if (string.IsNullOrWhiteSpace(requiredPin) || pinHeader != requiredPin)
            {
                return Forbid();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.Role = "Admin";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User promoted to admin" });
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
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "User";
            
            return Ok(new { 
                isAuthenticated = true, 
                userId,
                email = userEmail,
                role
            });
        }
        
        private async Task SignInUserAsync(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("FullName", user.FullName ?? ""),
                new Claim(ClaimTypes.Role, user.Role)
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

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var userId = int.Parse(userIdClaim.Value);
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Update basic profile fields
                if (!string.IsNullOrWhiteSpace(dto.FullName))
                    user.FullName = dto.FullName.Trim();
                
                if (!string.IsNullOrWhiteSpace(dto.Email))
                    user.Email = dto.Email.Trim();

                // Handle password update if provided
                if (!string.IsNullOrWhiteSpace(dto.NewPassword))
                {
                    // Verify current password
                    if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || 
                        !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    {
                        return BadRequest(new { message = "Current password is incorrect" });
                    }

                    // Update password
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                }

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role,
                    isAuthenticated = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update profile", error = ex.Message });
            }
        }
    }
}
