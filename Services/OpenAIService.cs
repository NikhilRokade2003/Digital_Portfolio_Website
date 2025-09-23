using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace DigitalPortfolioBackend.Services
{
    public class OpenAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public OpenAIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenAI:ApiKey"];
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        public async Task<string> GetChatResponseAsync(string userMessage)
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful AI portfolio assistant that provides professional advice on portfolio improvement, project descriptions, skill recommendations, and career guidance. Provide practical, actionable advice." },
                    new { role = "user", content = userMessage }
                },
                max_tokens = 500,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<JsonElement>(responseJson);
            var choices = responseObject.GetProperty("choices");
            var message = choices[0].GetProperty("message").GetProperty("content").GetString();

            return message;
        }

        public async Task<string> AnalyzePortfolioAsync(object portfolio)
        {
            var portfolioJson = JsonSerializer.Serialize(portfolio);
            var analysisPrompt = $"Analyze this portfolio and provide specific improvement recommendations:\\n\\n{portfolioJson}\\n\\nPlease provide:\\n1. Overall rating (1-10)\\n2. Strengths\\n3. Areas for improvement\\n4. Specific actionable suggestions\\n5. Industry comparison notes\\n\\nFormat your response in a professional, constructive manner.";

            return await GetChatResponseAsync(analysisPrompt);
        }

        public async Task<string> GenerateProjectDescriptionAsync(string projectName, string technologies, string purpose, string features, string role)
        {
            var prompt = $"Generate a professional project description for:\\n\\nProject Name: {projectName}\\nTechnologies: {technologies}\\nPurpose/Problem Solved: {purpose}\\nKey Features: {features}\\nYour Role: {role}\\n\\nCreate a compelling project description that:\\n- Highlights the problem solved and impact\\n- Mentions key technologies and your contributions\\n- Is concise but detailed (2-3 paragraphs)\\n- Uses professional language suitable for a portfolio\\n- Includes metrics or outcomes where possible";

            return await GetChatResponseAsync(prompt);
        }

        public async Task<string> SuggestSkillsAsync(string currentRole, string targetRole, string experience)
        {
            var prompt = $"Suggest the most valuable skills to learn for career advancement:\\n\\nCurrent Role: {currentRole}\\nTarget Role: {targetRole}\\nExperience Level: {experience}\\n\\nPlease provide:\\n1. Top 5 technical skills in demand for {targetRole}\\n2. Top 3 soft skills to develop\\n3. Certification recommendations\\n4. Learning path priorities\\n5. Industry trends to watch\\n\\nFocus on skills that are highly marketable in 2025.";

            return await GetChatResponseAsync(prompt);
        }

        public async Task<string> ReviewPortfolioSectionsAsync(object portfolio)
        {
            var portfolioJson = JsonSerializer.Serialize(portfolio);
            var reviewPrompt = $"Review this portfolio and rate each section on a scale of 1-10:\\n\\n{portfolioJson}\\n\\nProvide ratings and feedback for:\\n1. Professional Summary (clarity, impact, relevance)\\n2. Projects Section (quality, variety, presentation)\\n3. Skills Section (relevance, organization, completeness)\\n4. Experience Section (descriptions, achievements, progression)\\n5. Education Section (relevance, presentation)\\n6. Overall Design and User Experience\\n\\nFor each section, provide:\\n- Rating (1-10)\\n- What's working well\\n- Specific improvement suggestions\\n- Priority level for fixes (High/Medium/Low)";

            return await GetChatResponseAsync(reviewPrompt);
        }

        public async Task<object> GetChatResponseWithOptionsAsync(List<ChatMessage> messages)
        {
            var systemMessage = new ChatMessage
            {
                Role = "system",
                Content = "You are a helpful navigation assistant for Portfoliofy, a digital portfolio platform. When users greet you with hi/hello/hey or similar, ALWAYS respond with a welcome message and provide these exact 4 options: ['1. Create Portfolio', '2. View Portfolio', '3. Update Portfolio', '4. Get Info']. For option selections: '1. Create Portfolio' -> redirect to /portfolio/create, '2. View Portfolio' -> redirect to /portfolios, '3. Update Portfolio' -> redirect to /dashboard (they can select portfolio from there), '4. Get Info' -> redirect to /dashboard. Always respond in JSON format: {\"response\": \"your response text\", \"options\": [\"option1\", \"option2\"] or [], \"action\": {\"type\": \"redirect\", \"path\": \"/path\"} or null}. For any greeting, show the 4 menu options. For menu selections, redirect immediately."
            };

            var allMessages = new List<object> { new { role = systemMessage.Role, content = systemMessage.Content } };
            allMessages.AddRange(messages.Select(m => new { role = m.Role, content = m.Content }));

            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = allMessages,
                max_tokens = 300
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<JsonElement>(responseJson);
            var choices = responseObject.GetProperty("choices");
            var messageContent = choices[0].GetProperty("message").GetProperty("content").GetString();

            try
            {
                var parsed = JsonSerializer.Deserialize<ChatResponse>(messageContent);
                return new
                {
                    response = parsed.Response,
                    options = parsed.Options ?? new List<string>(),
                    action = parsed.Action
                };
            }
            catch
            {
                // Fallback if not JSON
                return new { response = messageContent, options = new List<string>(), action = (object)null };
            }
        }
    }

    public class ChatMessage
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }

    public class ChatResponse
    {
        public string Response { get; set; }
        public List<string> Options { get; set; }
        public ChatAction Action { get; set; }
    }

    public class ChatAction
    {
        public string Type { get; set; }
        public string Path { get; set; }
    }
}