using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DigitalPortfolioBackend.Services
{
    public class ProfessionalPDFGenerator
    {
        private readonly AppDbContext _context;

        public ProfessionalPDFGenerator(AppDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GeneratePortfolioPDF(int portfolioId)
        {
            try
            {
                // Get portfolio with all related data
                var portfolio = await _context.Portfolios
                    .Include(p => p.User)
                    .Include(p => p.Projects)
                    .Include(p => p.Educations)
                    .Include(p => p.Experiences)
                    .Include(p => p.Skills)
                    .Include(p => p.SocialMediaLinks)
                    .FirstOrDefaultAsync(p => p.Id == portfolioId);

                if (portfolio == null)
                {
                    throw new Exception("Portfolio not found");
                }

                var htmlContent = GenerateHtmlContent(portfolio);
                return Encoding.UTF8.GetBytes(htmlContent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ProfessionalPDFGenerator error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                var errorHtml = GenerateErrorHtml(ex.Message);
                return Encoding.UTF8.GetBytes(errorHtml);
            }
        }

        private string FormatImageUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return "https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=No+Image";
            }
            
            if (url.StartsWith("http"))
            {
                return url;
            }
            
            return $"http://localhost:5163{url}";
        }

        private string GenerateHtmlContent(Portfolio portfolio)
        {
            var html = new StringBuilder();
            
            html.Append(@"<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>" + portfolio.Title + @" - Portfoliofy Digital Portfolio</title>
    <style>
        @page {
            margin: 1.5cm;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            background-color: white;
            position: relative;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        

        
        /* Portfoliofy watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            font-weight: bold;
            color: rgba(79, 70, 229, 0.02);
            z-index: -1;
            user-select: none;
            pointer-events: none;
            font-family: Impact, Arial Black, sans-serif;
        }
        
        .container {
            padding: 15mm;
            position: relative;
            z-index: 1;
        }
        
        /* Header section */
        .header { 
            text-align: center;
            margin-bottom: 30px;
            padding: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 4px
            );
            animation: shimmer 20s linear infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .brand-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
        }
        
        .brand-logo {
            font-size: 20px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .generated-date {
            font-size: 11px;
            color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.1);
            padding: 4px 8px;
            border-radius: 15px;
        }
        
        .profile-section {
            position: relative;
            z-index: 2;
        }
        
        .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid white;
            margin-bottom: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .portfolio-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
        }
        
        .portfolio-author {
            font-size: 16px;
            font-weight: 300;
            margin: 0;
            opacity: 0.9;
        }
        
        /* Section styling */
        .section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title { 
            color: #4F46E5;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 2px solid #E0E7FF;
            padding-bottom: 8px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, #4F46E5, #7C3AED);
        }
        
        /* Content cards */
        .content-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #4F46E5;
        }
        
        .card-title {
            color: #1E293B;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px 0;
        }
        
        .card-subtitle {
            color: #64748B;
            font-size: 13px;
            font-weight: 500;
            margin: 0 0 6px 0;
        }
        
        .card-date {
            color: #94A3B8;
            font-size: 11px;
            margin: 0 0 8px 0;
            font-style: italic;
        }
        
        .card-description {
            color: #475569;
            font-size: 13px;
            line-height: 1.5;
            margin: 8px 0 0 0;
        }
        
        /* Contact information */
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-top: 10px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            background-color: #F1F5F9;
            border-radius: 6px;
            font-size: 12px;
        }
        
        .contact-icon {
            width: 16px;
            height: 16px;
            color: #4F46E5;
            flex-shrink: 0;
        }
        
        /* Skills styling */
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .skill-tag { 
            display: inline-block;
            padding: 6px 12px;
            background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
            color: #4338CA;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid #C7D2FE;
        }
        
        /* Project images */
        .project-image {
            max-width: 100%;
            max-height: 120px;
            margin: 8px 0;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Links */
        a {
            color: #4F46E5;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Footer */
        .footer { 
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
            border-radius: 12px;
            border: 2px solid #E2E8F0;
        }
        
        .footer-brand {
            font-size: 16px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 8px;
        }
        
        .footer-text {
            font-size: 10px;
            color: #64748B;
            line-height: 1.4;
        }
        
        /* Print button */
        .print-button {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
            margin: 20px auto;
            display: block;
        }
        
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }
        
        @media print {
            .print-button { display: none !important; }
            body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .page-border { 
                display: block !important;
                position: fixed !important;
                top: 8mm !important;
                left: 8mm !important;
                right: 8mm !important;
                bottom: 8mm !important;
            }
            .container {
                padding: 12mm !important;
            }
        }
    </style>
    <script>
        function printDocument() {
            window.print();
        }
        window.onload = function() {
            document.getElementById('printButton').addEventListener('click', printDocument);
            // Auto-print after 2 seconds
            setTimeout(function() {
                window.print();
            }, 2000);
        };
    </script>
</head>
<body>

    
    <!-- Portfoliofy watermark -->
    <div class='watermark'>PORTFOLIOFY</div>
    
    <button id='printButton' class='print-button'>📄 Download as PDF</button>
    
    <div class='container'>
        <!-- Header with branding -->
        <div class='header'>
            <div class='brand-header'>
                <div class='brand-logo'>📋 PORTFOLIOFY</div>
                <div class='generated-date'>Generated: " + DateTime.Now.ToString("MMM dd, yyyy HH:mm") + @"</div>
            </div>
            <div class='profile-section'>
                <img src='" + FormatImageUrl(portfolio.ProfileImage) + @"' alt='Profile' class='profile-image'>
                <h1 class='portfolio-title'>" + portfolio.Title + @"</h1>
                <p class='portfolio-author'>by " + portfolio.User.FullName + @"</p>
            </div>
        </div>");

            // About section
            if (!string.IsNullOrEmpty(portfolio.Description))
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>About Me</h2>
                    <div class='content-card'>
                        <p class='card-description'>" + portfolio.Description + @"</p>
                    </div>
                </div>");
            }

            // Contact Information
            var hasContactInfo = !string.IsNullOrEmpty(portfolio.Email) || 
                               !string.IsNullOrEmpty(portfolio.Phone) || 
                               !string.IsNullOrEmpty(portfolio.City) || 
                               !string.IsNullOrEmpty(portfolio.Country);

            if (hasContactInfo)
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Contact Information</h2>
                    <div class='content-card'>
                        <div class='contact-grid'>");

                if (!string.IsNullOrEmpty(portfolio.Email))
                {
                    html.Append(@"
                        <div class='contact-item'>
                            <svg class='contact-icon' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/>
                                <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>
                            </svg>
                            <div><strong>Email:</strong><br/>" + portfolio.Email + @"</div>
                        </div>");
                }

                if (!string.IsNullOrEmpty(portfolio.Phone))
                {
                    html.Append(@"
                        <div class='contact-item'>
                            <svg class='contact-icon' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>
                            </svg>
                            <div><strong>Phone:</strong><br/>" + portfolio.Phone + @"</div>
                        </div>");
                }

                if (!string.IsNullOrEmpty(portfolio.City) || !string.IsNullOrEmpty(portfolio.Country))
                {
                    var location = $"{portfolio.City}{(!string.IsNullOrEmpty(portfolio.City) && !string.IsNullOrEmpty(portfolio.Country) ? ", " : "")}{portfolio.Country}";
                    html.Append(@"
                        <div class='contact-item'>
                            <svg class='contact-icon' fill='currentColor' viewBox='0 0 20 20'>
                                <path fill-rule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clip-rule='evenodd'/>
                            </svg>
                            <div><strong>Location:</strong><br/>" + location + @"</div>
                        </div>");
                }

                html.Append(@"
                        </div>
                    </div>
                </div>");
            }

            // Projects section
            if (portfolio.IsProjectsPublic && portfolio.Projects != null && portfolio.Projects.Any())
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Projects</h2>");

                foreach (var project in portfolio.Projects.OrderByDescending(p => p.Id))
                {
                    html.Append(@"
                    <div class='content-card'>
                        <h3 class='card-title'>" + project.Title + @"</h3>");

                    if (!string.IsNullOrEmpty(project.Description))
                    {
                        html.Append(@"<p class='card-description'>" + project.Description + @"</p>");
                    }

                    if (!string.IsNullOrEmpty(project.ProjectUrl))
                    {
                        html.Append(@"<p style='margin-top: 8px; font-size: 12px;'><strong>URL:</strong> <a href='" + project.ProjectUrl + @"'>" + project.ProjectUrl + @"</a></p>");
                    }

                    if (!string.IsNullOrEmpty(project.ImageUrl))
                    {
                        html.Append(@"<img src='" + FormatImageUrl(project.ImageUrl) + @"' alt='Project Screenshot' class='project-image'>");
                    }

                    html.Append("</div>");
                }

                html.Append("</div>");
            }

            // Education section
            if (portfolio.IsEducationPublic && portfolio.Educations != null && portfolio.Educations.Any())
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Education</h2>");

                foreach (var education in portfolio.Educations.OrderByDescending(e => e.StartDate))
                {
                    html.Append(@"
                    <div class='content-card'>
                        <h3 class='card-title'>" + education.Degree + @"</h3>
                        <p class='card-subtitle'>" + education.Institution + @"</p>");

                    if (!string.IsNullOrEmpty(education.Field))
                    {
                        html.Append(@"<p class='card-subtitle'>Field: " + education.Field + @"</p>");
                    }

                    var startDate = education.StartDate.ToString("MMM yyyy");
                    var endDate = education.EndDate?.ToString("MMM yyyy") ?? "Present";
                    html.Append(@"<p class='card-date'>" + startDate + @" - " + endDate + @"</p>");

                    html.Append("</div>");
                }

                html.Append("</div>");
            }

            // Experience section
            if (portfolio.IsExperiencePublic && portfolio.Experiences != null && portfolio.Experiences.Any())
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Experience</h2>");

                foreach (var experience in portfolio.Experiences.OrderByDescending(e => e.StartDate))
                {
                    html.Append(@"
                    <div class='content-card'>
                        <h3 class='card-title'>" + experience.Position + @"</h3>
                        <p class='card-subtitle'>" + experience.Company + @"</p>");

                    var startDate = experience.StartDate.ToString("MMM yyyy");
                    var endDate = experience.EndDate?.ToString("MMM yyyy") ?? "Present";
                    html.Append(@"<p class='card-date'>" + startDate + @" - " + endDate + @"</p>");

                    if (!string.IsNullOrEmpty(experience.Description))
                    {
                        html.Append(@"<p class='card-description'>" + experience.Description + @"</p>");
                    }

                    html.Append("</div>");
                }

                html.Append("</div>");
            }

            // Skills section
            if (portfolio.IsSkillsPublic && portfolio.Skills != null && portfolio.Skills.Any())
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Skills & Expertise</h2>
                    <div class='content-card'>
                        <div class='skills-container'>");

                foreach (var skill in portfolio.Skills.OrderBy(s => s.Name))
                {
                    html.Append(@"<span class='skill-tag'>" + skill.Name + @"</span>");
                }

                html.Append(@"
                        </div>
                    </div>
                </div>");
            }

            // Social Media section
            if (portfolio.IsSocialMediaPublic && portfolio.SocialMediaLinks != null && portfolio.SocialMediaLinks.Any())
            {
                html.Append(@"
                <div class='section'>
                    <h2 class='section-title'>Connect With Me</h2>");

                foreach (var link in portfolio.SocialMediaLinks.OrderBy(l => l.Platform))
                {
                    html.Append(@"
                    <div class='content-card'>
                        <h3 class='card-title'>" + link.Platform + @"</h3>
                        <p><a href='" + link.Url + @"'>" + link.Url + @"</a></p>
                    </div>");
                }

                html.Append("</div>");
            }

            // Professional footer
            html.Append(@"
        <div class='footer'>
            <div class='footer-brand'>📋 PORTFOLIOFY</div>
            <div class='footer-text'>
                <p><strong>Digital Portfolio Platform - Empowering Professionals Worldwide</strong></p>
                <p>Generated on " + DateTime.Now.ToString("MMMM dd, yyyy 'at' HH:mm") + @"</p>
                <p>Visit <strong>Portfoliofy.com</strong> to create your professional digital portfolio today!</p>
            </div>
        </div>
    </div>
</body>
</html>");

            return html.ToString();
        }

        private string GenerateErrorHtml(string errorMessage)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <title>Error - Portfolio Generation</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
                    .error-container {{ 
                        background: white;
                        border: 2px solid #dc3545; 
                        padding: 30px; 
                        border-radius: 10px;
                        max-width: 600px;
                        margin: 0 auto;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.1);
                    }}
                    h1 {{ color: #dc3545; margin-bottom: 20px; }}
                    .brand {{ color: #4F46E5; font-weight: bold; margin-bottom: 20px; }}
                    .error-details {{ 
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        text-align: left;
                        font-family: monospace;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class='error-container'>
                    <div class='brand'>📋 PORTFOLIOFY</div>
                    <h1>Portfolio Generation Error</h1>
                    <p>We apologize, but there was an error generating your portfolio PDF.</p>
                    <div class='error-details'>
                        <p><strong>Error details:</strong> {errorMessage}</p>
                    </div>
                    <p>Please try again later or contact support if this problem persists.</p>
                </div>
            </body>
            </html>";
        }
    }
}