using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using DigitalPortfolioBackend.Services;

namespace DigitalPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication
    public class ChatbotController : ControllerBase
    {
        private readonly OpenAIService _openAIService;

        public ChatbotController(OpenAIService openAIService)
        {
            _openAIService = openAIService;
        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty");
            }

            try
            {
                var response = await _openAIService.GetChatResponseAsync(request.Message);
                return Ok(new { response });
            }
            catch (System.Exception ex)
            {
                // Log the error
                Console.WriteLine($"Chatbot error: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("ask-with-options")]
        public async Task<IActionResult> AskWithOptions([FromBody] ChatRequestWithMessages request)
        {
            if (request.Messages == null || !request.Messages.Any())
            {
                return BadRequest("Messages cannot be empty");
            }

            try
            {
                var result = await _openAIService.GetChatResponseWithOptionsAsync(request.Messages);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                // Log the error
                Console.WriteLine($"Chatbot error: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("analyze-portfolio")]
        public async Task<IActionResult> AnalyzePortfolio([FromBody] object portfolioData)
        {
            try
            {
                var analysis = await _openAIService.AnalyzePortfolioAsync(portfolioData);
                return Ok(new { response = analysis });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Portfolio analysis error: {ex.Message}");
                return StatusCode(500, "An error occurred while analyzing the portfolio.");
            }
        }

        [HttpPost("generate-project-description")]
        public async Task<IActionResult> GenerateProjectDescription([FromBody] ProjectDescriptionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ProjectName) || string.IsNullOrWhiteSpace(request.Technologies))
            {
                return BadRequest("Project name and technologies are required");
            }

            try
            {
                var description = await _openAIService.GenerateProjectDescriptionAsync(
                    request.ProjectName,
                    request.Technologies,
                    request.Purpose ?? "",
                    request.Features ?? "",
                    request.Role ?? ""
                );
                return Ok(new { response = description });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Project description generation error: {ex.Message}");
                return StatusCode(500, "An error occurred while generating the project description.");
            }
        }

        [HttpPost("suggest-skills")]
        public async Task<IActionResult> SuggestSkills([FromBody] SkillSuggestionRequest request)
        {
            try
            {
                var suggestions = await _openAIService.SuggestSkillsAsync(
                    request.CurrentRole ?? "Developer",
                    request.TargetRole ?? "Senior Developer",
                    request.Experience ?? "Mid-level"
                );
                return Ok(new { response = suggestions });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Skill suggestion error: {ex.Message}");
                return StatusCode(500, "An error occurred while suggesting skills.");
            }
        }

        [HttpPost("review-portfolio")]
        public async Task<IActionResult> ReviewPortfolio([FromBody] object portfolioData)
        {
            try
            {
                var review = await _openAIService.ReviewPortfolioSectionsAsync(portfolioData);
                return Ok(new { response = review });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Portfolio review error: {ex.Message}");
                return StatusCode(500, "An error occurred while reviewing the portfolio.");
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                // For now, return empty history as this feature is not fully implemented
                var history = new List<object>();
                return Ok(history);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Chat history error: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving chat history.");
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }

    public class ChatRequestWithMessages
    {
        public List<DigitalPortfolioBackend.Services.ChatMessage> Messages { get; set; }
    }

    public class ProjectDescriptionRequest
    {
        public string ProjectName { get; set; }
        public string Technologies { get; set; }
        public string Purpose { get; set; }
        public string Features { get; set; }
        public string Role { get; set; }
    }

    public class SkillSuggestionRequest
    {
        public string CurrentRole { get; set; }
        public string TargetRole { get; set; }
        public string Experience { get; set; }
    }
}
