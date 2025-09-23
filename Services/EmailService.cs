using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace DigitalPortfolioBackend.Services
{
    public class EmailService
    {
        private readonly SmtpSettings _settings;

        public EmailService(SmtpSettings settings)
        {
            _settings = settings;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(_settings.Host))
            {
                Console.WriteLine("SMTP is not configured. Skipping email send.");
                return;
            }

            using (var client = new SmtpClient(_settings.Host, _settings.Port))
            {
                client.EnableSsl = _settings.EnableSsl;
                if (!string.IsNullOrWhiteSpace(_settings.Username))
                {
                    client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
                }

                var fromAddress = new MailAddress(_settings.FromEmail ?? _settings.Username, _settings.FromName ?? "Digital Portfolio");
                var toAddress = new MailAddress(toEmail);

                using (var message = new MailMessage(fromAddress, toAddress))
                {
                    message.Subject = subject;
                    message.Body = htmlBody;
                    message.IsBodyHtml = true;
                    await client.SendMailAsync(message);
                }
            }
        }

        public Task SendRegistrationConfirmationAsync(string toEmail, string fullName)
        {
            var safeName = string.IsNullOrWhiteSpace(fullName) ? "there" : fullName;
            var subject = "Welcome to Digital Portfolio!";
            var body = $@"<div style='font-family:Arial,sans-serif;'>
                <h2>Welcome, {WebUtility.HtmlEncode(safeName)} 🎉</h2>
                <p>Your account has been created successfully.</p>
                <p>You can now sign in and start building your professional portfolio.</p>
                <hr />
                <p style='color:#6b7280;font-size:12px;'>This is an automated message. Please do not reply.</p>
            </div>";
            return SendEmailAsync(toEmail, subject, body);
        }

        public Task SendAccessRequestedAsync(string toEmail, string ownerName, string requesterName, string portfolioTitle)
        {
            var subject = $"Access requested for '{WebUtility.HtmlEncode(portfolioTitle)}'";
            var body = $@"<div style='font-family:Arial,sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px;'>
                    <h2 style='color: #2d3748; margin-bottom: 20px;'>Access Request Notification</h2>
                    <h3>Hello {WebUtility.HtmlEncode(ownerName)},</h3>
                    <p style='font-size: 16px; color: #4a5568; line-height: 1.6;'>
                        <strong>{WebUtility.HtmlEncode(requesterName)}</strong> has requested access to view your private portfolio '<em>{WebUtility.HtmlEncode(portfolioTitle)}</em>'.
                    </p>
                    <div style='background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3182ce;'>
                        <p style='margin: 0; color: #2d3748;'>
                            <strong>Action Required:</strong> Please review and respond to this access request.
                        </p>
                    </div>
                    <div style='text-align: center; margin: 25px 0;'>
                        <p style='margin-bottom: 15px; color: #4a5568;'>You can view this notification from your dashboard.</p>
                        <a href='http://localhost:5174/notifications' 
                           style='display: inline-block; background: linear-gradient(135deg, #3182ce, #2b77cb); 
                                  color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; 
                                  font-weight: 600; margin: 5px; box-shadow: 0 4px 15px rgba(49, 130, 206, 0.4);'>
                            🔔 View Notifications
                        </a> 
                                  font-weight: 600; margin: 5px; box-shadow: 0 4px 15px rgba(49, 130, 206, 0.4);'>
                            🔔 View Notifications
                        </a>
                    </div>
                    <p style='margin: 20px 0; font-size: 14px; color: #6b7280;'>
                        💡 <strong>Tip:</strong> You can manage all your access requests from the Access Requests panel in your account dashboard.
                    </p>
                </div>
                <hr style='margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;'/>
                <p style='color:#6b7280;font-size:12px; text-align: center;'>This is an automated message. Please do not reply.</p>
            </div>";
            return SendEmailAsync(toEmail, subject, body);
        }

        public Task SendAccessDecisionAsync(string toEmail, string requesterName, string portfolioTitle, bool approved)
        {
            var subject = approved ? "✅ Your access request was approved" : "❌ Your access request was rejected";
            var statusColor = approved ? "#48bb78" : "#f56565";
            var statusText = approved ? "APPROVED" : "REJECTED";
            var message = approved 
                ? "Great news! You now have access to view the requested portfolio."
                : "Unfortunately, your request to view this portfolio has been declined.";
            
            var actionSection = approved 
                ? @"<div style='text-align: center; margin: 25px 0;'>
                     <p style='margin-bottom: 15px; color: #4a5568;'>You can now view the portfolio by logging into your account.</p>
                     <a href='http://localhost:5174/dashboard' 
                        style='display: inline-block; background: linear-gradient(135deg, #3182ce, #2b77cb); 
                               color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; 
                               font-weight: 600; margin: 10px; box-shadow: 0 4px 15px rgba(49, 130, 206, 0.4);'>
                        📂 View Your Accessible Portfolios
                     </a>
                   </div>"
                : @"<div style='text-align: center; margin: 25px 0;'>
                     <p style='color: #6b7280; font-size: 14px;'>You can request access to other portfolios from the Browse page.</p>
                     <a href='http://localhost:5174/dashboard' 
                        style='display: inline-block; background: linear-gradient(135deg, #4b5563, #374151); 
                               color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; 
                               font-weight: 500; margin-top: 10px;'>
                        🔍 Browse Other Portfolios
                     </a>
                   </div>";

            var body = $@"<div style='font-family:Arial,sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px;'>
                    <h2 style='color: #2d3748; margin-bottom: 20px;'>Access Request Update</h2>
                    <h3>Hello {WebUtility.HtmlEncode(requesterName)},</h3>
                    
                    <div style='background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid {statusColor};'>
                        <h4 style='margin: 0 0 10px 0; color: {statusColor};'>REQUEST {statusText}</h4>
                        <p style='margin: 0; color: #2d3748;'>
                            Your request to view '<em>{WebUtility.HtmlEncode(portfolioTitle)}</em>' has been <strong style='color: {statusColor};'>{statusText.ToLower()}</strong>.
                        </p>
                    </div>
                    
                    <p style='font-size: 16px; color: #4a5568; line-height: 1.6;'>{message}</p>
                    
                    {actionSection}
                </div>
                <hr style='margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;'/>
                <p style='color:#6b7280;font-size:12px; text-align: center;'>This is an automated message. Please do not reply.</p>
            </div>";
            return SendEmailAsync(toEmail, subject, body);
        }

        public Task SendForgotPasswordContactAdminAsync(string toEmail, string adminName, string adminEmail, string adminPhone)
        {
            var subject = "Password assistance";
            var contactLines = $@"<p>Please contact the administrator for password assistance.</p>
                <p><strong>Admin:</strong> {WebUtility.HtmlEncode(adminName)}</p>
                <p><strong>Email:</strong> {WebUtility.HtmlEncode(adminEmail)}</p>";
            if (!string.IsNullOrWhiteSpace(adminPhone))
            {
                contactLines += $"<p><strong>Phone:</strong> {WebUtility.HtmlEncode(adminPhone)}</p>";
            }
            var body = $@"<div style='font-family:Arial,sans-serif;'>
                <h3>Hello,</h3>
                <p>We received a request to reset the password for the account associated with this email.</p>
                <p>For security, password resets are handled by the administrator.</p>
                {contactLines}
                <hr />
                <p style='color:#6b7280;font-size:12px;'>This is an automated message. Please do not reply.</p>
            </div>";
            return SendEmailAsync(toEmail, subject, body);
        }

        public Task SendAccessRequestNotificationAsync(string portfolioOwnerEmail, string portfolioOwnerName, string requesterName, string portfolioTitle, string requestMessage)
        {
            var safeName = string.IsNullOrWhiteSpace(portfolioOwnerName) ? "Portfolio Owner" : portfolioOwnerName;
            var subject = "New Access Request for Your Portfolio";
            var messageSection = string.IsNullOrWhiteSpace(requestMessage) ? "" : 
                $"<p><strong>Message from requester:</strong></p><p style='background:#f3f4f6;padding:10px;border-left:4px solid #3b82f6;'><em>\"{requestMessage}\"</em></p>";
            
            var body = $@"<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
                <h2 style='color:#1f2937;'>New Access Request</h2>
                <p>Hello {safeName},</p>
                <p><strong>{requesterName}</strong> has requested access to your private portfolio <strong>'{portfolioTitle}'</strong>.</p>
                {messageSection}
                <p>You can approve or reject this request by logging into your Digital Portfolio dashboard and checking your notifications.</p>
                <div style='margin:20px 0;padding:15px;background:#f9fafb;border-radius:8px;'>
                    <p style='margin:0;color:#4b5563;'><strong>Next Steps:</strong></p>
                    <ul style='color:#4b5563;margin:10px 0;'>
                        <li>Log into your Digital Portfolio account</li>
                        <li>Check your notifications panel</li>
                        <li>Review and respond to the access request</li>
                    </ul>
                </div>
                <hr style='border:none;height:1px;background:#e5e7eb;margin:30px 0;'/>
                <p style='color:#6b7280;font-size:12px;'>This is an automated message from Digital Portfolio. Please do not reply directly to this email.</p>
            </div>";
            return SendEmailAsync(portfolioOwnerEmail, subject, body);
        }
    }

    public class SmtpSettings
    {
        public string Host { get; set; }
        public int Port { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string Username { get; set; }
        public string Password { get; set; }
        public string FromEmail { get; set; }
        public string FromName { get; set; }
    }
}


