using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Reflection;

namespace DigitalPortfolioBackend.Services
{
    public class SimplePDFGenerator
    {
        private readonly AppDbContext _context;

        public SimplePDFGenerator(AppDbContext context)
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
                    .Include(p => p.SocialMediaLinks) // Ensure we include social media links
                    .FirstOrDefaultAsync(p => p.Id == portfolioId);

                if (portfolio == null)
                {
                    throw new Exception("Portfolio not found");
                }

                // Since we're having issues with PDF libraries, we'll create an HTML file
                // that browsers can render as PDF when downloaded
                var htmlContent = GenerateHtmlContent(portfolio);
                
                // Return the HTML content as bytes - browsers will open this as a webpage
                // which can then be printed to PDF by the user
                return Encoding.UTF8.GetBytes(htmlContent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SimplePDFGenerator error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // In case of error, return a simple HTML with error message
                var errorHtml = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset='UTF-8'>
                        <title>Error - Portfolio PDF</title>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 40px; }}
                            .error-container {{ 
                                border: 2px solid #d63031; 
                                padding: 20px; 
                                border-radius: 10px;
                                max-width: 600px;
                                margin: 0 auto;
                                text-align: center;
                            }}
                            h1 {{ color: #d63031; }}
                            .error-details {{ 
                                background-color: #f8f9fa;
                                padding: 10px;
                                border-radius: 5px;
                                margin-top: 20px;
                                text-align: left;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='error-container'>
                            <h1>Error Generating Portfolio PDF</h1>
                            <p>We apologize, but there was an error generating your portfolio PDF.</p>
                            <div class='error-details'>
                                <p><strong>Error details:</strong> {ex.Message}</p>
                            </div>
                            <p>Please try again later or contact support if this problem persists.</p>
                        </div>
                    </body>
                    </html>
                ";
                
                return Encoding.UTF8.GetBytes(errorHtml);
            }
        }

        private string GenerateHtmlContent(Portfolio portfolio)
        {
            var html = new StringBuilder();
            
            // Format image URLs to absolute URLs
            string FormatImageUrl(string url)
            {
                if (string.IsNullOrEmpty(url))
                {
                    return "https://via.placeholder.com/200";
                }
                
                if (url.StartsWith("http"))
                {
                    return url;
                }
                
                return $"http://localhost:5163{url}";
            }

            // Add HTML header and styles
            html.Append(@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                    <title>" + portfolio.Title + @" - Portfolio</title>
                    <style>
                        @media print {
                            body { 
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                color: #333;
                            }
                            .print-button {
                                display: none;
                            }
                        }
                        
                        @media screen {
                            body { 
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                color: #333;
                                max-width: 900px;
                                margin: 0 auto;
                                background-color: #f5f5f5;
                            }
                            .content {
                                background-color: white;
                                padding: 40px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                border-radius: 8px;
                                margin-top: 20px;
                            }
                            .print-button {
                                background-color: #4F46E5;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                                display: block;
                                margin: 20px auto;
                                font-size: 16px;
                            }
                            .print-button:hover {
                                background-color: #4338CA;
                            }
                        }
                        
                        .header { 
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #6366F1;
                            padding-bottom: 20px;
                        }
                        .profile-header {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            margin-bottom: 30px;
                        }
                        .profile-image {
                            width: 150px;
                            height: 150px;
                            border-radius: 50%;
                            object-fit: cover;
                            border: 4px solid #6366F1;
                            margin-bottom: 15px;
                        }
                        h1 { 
                            color: #4F46E5;
                            margin-bottom: 5px;
                        }
                        h2 { 
                            color: #4F46E5;
                            border-bottom: 1px solid #E5E7EB;
                            padding-bottom: 10px;
                            margin-top: 30px;
                        }
                        h3 { 
                            color: #4338CA;
                            margin-bottom: 5px;
                        }
                        .section { 
                            margin-bottom: 25px;
                        }
                        .project { 
                            margin-bottom: 20px;
                            padding: 15px;
                            border-left: 4px solid #818CF8;
                            background-color: #F9FAFB;
                        }
                        .project-image {
                            max-width: 100%;
                            max-height: 200px;
                            margin-top: 10px;
                            border-radius: 4px;
                        }
                        .education, .experience { 
                            margin-bottom: 20px;
                            padding: 15px;
                            border-left: 4px solid #6366F1;
                            background-color: #F9FAFB;
                        }
                        .skill { 
                            display: inline-block;
                            margin: 5px;
                            padding: 8px 16px;
                            background-color: #EEF2FF;
                            border-radius: 20px;
                        }
                        .social-link {
                            display: block;
                            margin-bottom: 10px;
                            padding: 10px;
                            border-left: 4px solid #8B5CF6;
                            background-color: #F9FAFB;
                        }
                        .footer { 
                            text-align: center;
                            margin-top: 40px;
                            font-size: 12px;
                            color: #6B7280;
                            border-top: 1px solid #E5E7EB;
                            padding-top: 20px;
                        }
                        @page {
                            margin: 2cm;
                        }
                    </style>
                    <script>
                        function printDocument() {
                            window.print();
                        }
                        window.onload = function() {
                            // Add print button functionality
                            document.getElementById('printButton').addEventListener('click', printDocument);
                            
                            // Show print dialog automatically after a brief delay
                            setTimeout(function() {
                                window.print();
                            }, 1000);
                        };
                    </script>
                </head>
                <body>
                    <button id='printButton' class='print-button'>Print Portfolio as PDF</button>
                    <div class='content'>
                        <div class='header'>
                            <div class='profile-header'>
                                <img src='" + FormatImageUrl(portfolio.ProfileImage) + @"' alt='Profile Image' class='profile-image'>
                                <h1>" + portfolio.Title + @"</h1>
                                <p> " + portfolio.User.FullName + @"</p>
                            </div>
                        </div>
            ");

            // About section
            html.Append(@"
                <div class='section'>
                    <h2>About</h2>
                    <p>" + portfolio.Description + @"</p>
                </div>
            ");

            // Contact Information section
            html.Append(@"<div class='section'><h2>Contact Information</h2>");
            bool hasContactInfo = false;
            
            if (!string.IsNullOrEmpty(portfolio.Email))
            {
                html.Append(@"<p><strong>Email:</strong> " + portfolio.Email + @"</p>");
                hasContactInfo = true;
            }
            
            if (!string.IsNullOrEmpty(portfolio.Phone))
            {
                html.Append(@"<p><strong>Phone:</strong> " + portfolio.Phone + @"</p>");
                hasContactInfo = true;
            }
            
            // Show location only if city or country is provided
            if (!string.IsNullOrEmpty(portfolio.City) || !string.IsNullOrEmpty(portfolio.Country))
            {
                string location = string.Join(", ", new[] { portfolio.City, portfolio.Country }.Where(x => !string.IsNullOrEmpty(x)));
                html.Append(@"<p><strong>Location:</strong> " + location + @"</p>");
                hasContactInfo = true;
            }
            
            if (!hasContactInfo)
            {
                html.Append("<p>No contact information provided.</p>");
            }
            
            html.Append("</div>");

            // Projects section - only include if visible
            if (portfolio.IsProjectsPublic)
            {
                html.Append(@"<div class='section'><h2>Projects</h2>");
                if (portfolio.Projects != null && portfolio.Projects.Any())
                {
                    foreach (var project in portfolio.Projects)
                    {
                        html.Append(@"
                            <div class='project'>
                                <h3>" + project.Title + @"</h3>
                                <p>" + project.Description + @"</p>");
                        
                        if (!string.IsNullOrEmpty(project.ImageUrl))
                        {
                            html.Append(@"<img src='" + FormatImageUrl(project.ImageUrl) + @"' alt='" + project.Title + @"' class='project-image'>");
                        }
                        
                        if (!string.IsNullOrEmpty(project.ProjectUrl))
                        {
                            html.Append(@"<p><strong>Project Link:</strong> <a href='" + project.ProjectUrl + @"'>" + project.ProjectUrl + @"</a></p>");
                        }
                        
                        html.Append(@"</div>");
                    }
                }
                else
                {
                    html.Append("<p>No projects added yet.</p>");
                }
                html.Append("</div>");
            }

            // Education section - only include if visible
            if (portfolio.IsEducationPublic)
            {
                html.Append(@"<div class='section'><h2>Education</h2>");
                if (portfolio.Educations != null && portfolio.Educations.Any())
                {
                    foreach (var education in portfolio.Educations)
                    {
                        var endDate = education.EndDate.HasValue ? education.EndDate.Value.ToString("MMM yyyy") : "Present";
                        html.Append(@"
                            <div class='education'>
                                <h3>" + education.Degree + (string.IsNullOrEmpty(education.Field) ? "" : " in " + education.Field) + @"</h3>
                                <p><strong>" + education.Institution + @"</strong></p>
                                <p>" + education.StartDate.ToString("MMM yyyy") + " - " + endDate + @"</p>
                                <p>" + education.Description + @"</p>
                            </div>
                        ");
                    }
                }
                else
                {
                    html.Append("<p>No education information added yet.</p>");
                }
                html.Append("</div>");
            }

            // Experience section - only include if visible
            if (portfolio.IsExperiencePublic)
            {
                html.Append(@"<div class='section'><h2>Work Experience</h2>");
                if (portfolio.Experiences != null && portfolio.Experiences.Any())
                {
                    foreach (var experience in portfolio.Experiences)
                    {
                        var endDate = experience.EndDate.HasValue ? experience.EndDate.Value.ToString("MMM yyyy") : "Present";
                        html.Append(@"
                            <div class='experience'>
                                <h3>" + experience.Position + @"</h3>
                                <p><strong>" + experience.Company + @"</strong>" + (string.IsNullOrEmpty(experience.Location) ? "" : " - " + experience.Location) + @"</p>
                                <p>" + experience.StartDate.ToString("MMM yyyy") + " - " + endDate + @"</p>
                                <p>" + experience.Description + @"</p>
                            </div>
                        ");
                    }
                }
                else
                {
                    html.Append("<p>No work experience added yet.</p>");
                }
                html.Append("</div>");
            }

            // Skills section - only include if visible
            if (portfolio.IsSkillsPublic)
            {
                html.Append(@"<div class='section'><h2>Skills</h2>");
                if (portfolio.Skills != null && portfolio.Skills.Any())
                {
                    foreach (var skill in portfolio.Skills)
                    {
                        html.Append(@"<div class='skill'>" + skill.Name + @"</div>");
                    }
                }
                else
                {
                    html.Append("<p>No skills added yet.</p>");
                }
                html.Append("</div>");
            }

            // Social Media Links section - only include if visible
            if (portfolio.IsSocialMediaPublic)
            {
                html.Append(@"<div class='section'><h2>Connect With Me</h2>");
                if (portfolio.SocialMediaLinks != null && portfolio.SocialMediaLinks.Any())
                {
                    foreach (var link in portfolio.SocialMediaLinks)
                    {
                        html.Append(@"
                            <div class='social-link'>
                                <h3>" + link.Platform + @"</h3>
                                <p><a href='" + link.Url + @"' target='_blank'>" + link.Url + @"</a></p>
                            </div>
                        ");
                    }
                }
                else
                {
                    html.Append("<p>No social media links added yet.</p>");
                }
                html.Append("</div>");
            }

            // Footer
            html.Append(@"
                        <div class='footer'>
                            <p>Generated on " + DateTime.Now.ToString("MMMM dd, yyyy") + @" | Digital Portfolio Platform</p>
                        </div>
                    </div>
                </body>
                </html>
            ");

            return html.ToString();
        }
    }
}