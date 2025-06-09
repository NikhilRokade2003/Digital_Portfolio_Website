using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.IO;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ImageUploadController> _logger;

        public ImageUploadController(IWebHostEnvironment environment, ILogger<ImageUploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file was uploaded.");
                }

                // Check file extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Invalid file type. Only jpg, jpeg, png, and gif are allowed.");
                }

                // Create directory if it doesn't exist
                string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "profiles");
                Directory.CreateDirectory(uploadsFolder);

                // Create unique filename
                string uniqueFileName = $"{Guid.NewGuid()}{extension}";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var image = await Image.LoadAsync(file.OpenReadStream()))
                {
                    // Resize image if needed
                    if (image.Width > 800 || image.Height > 800)
                    {
                        image.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(800, 800),
                            Mode = ResizeMode.Max
                        }));
                    }

                    // Save the processed image
                    await image.SaveAsync(filePath, new JpegEncoder { Quality = 75 });
                }

                // Return the URL for the saved image
                var imageUrl = $"/uploads/profiles/{uniqueFileName}";
                return Ok(new { url = imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile image");
                return StatusCode(500, "An error occurred while uploading the image.");
            }
        }

        [Authorize]
        [HttpPost("project")]
        public async Task<IActionResult> UploadProjectImage([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file was uploaded.");
                }

                // Check file extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Invalid file type. Only jpg, jpeg, png, and gif are allowed.");
                }

                // Create directory if it doesn't exist
                string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "projects");
                Directory.CreateDirectory(uploadsFolder);

                // Create unique filename
                string uniqueFileName = $"{Guid.NewGuid()}{extension}";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var image = await Image.LoadAsync(file.OpenReadStream()))
                {
                    // Resize image if needed - for projects use a wider image
                    if (image.Width > 1200 || image.Height > 800)
                    {
                        image.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(1200, 800),
                            Mode = ResizeMode.Max
                        }));
                    }

                    // Save the processed image
                    await image.SaveAsync(filePath, new JpegEncoder { Quality = 75 });
                }

                // Return the URL for the saved image
                var imageUrl = $"/uploads/projects/{uniqueFileName}";
                return Ok(new { url = imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading project image");
                return StatusCode(500, "An error occurred while uploading the image.");
            }
        }
    }
}