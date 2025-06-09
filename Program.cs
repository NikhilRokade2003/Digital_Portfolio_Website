using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Data;
using DigitalPortfolioBackend.Middleware;
using DigitalPortfolioBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext with MySQL configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Register PDF services
builder.Services.AddScoped<SimplePDFGenerator>();
builder.Services.AddScoped<PDFGeneratorService>();

// Configure CORS to allow frontend requests
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Get allowed origins from configuration or environment variables
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:3000", "http://localhost:5173" };
            
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Important for cookies!
    });
});

// Cookie authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "DigitalPortfolioAuth";
        options.Cookie.HttpOnly = true; // Prevents JavaScript access
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;
        options.LoginPath = "/api/Auth/login";
        options.LogoutPath = "/api/Auth/logout";

        // For API applications, set events to handle unauthorized scenarios
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = 401;
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = 403;
                return Task.CompletedTask;
            }
        };

        // Set SameSite policy for cookies
        options.Cookie.SameSite = SameSiteMode.Lax;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Comment out HTTPS redirection in development for HTTP communication
    // app.UseHttpsRedirection();
}
else
{
    app.UseHttpsRedirection();
}

// Apply CORS before any other middleware that might generate responses
// IMPORTANT: UseCors must be called before UseRouting and before UseAuthentication and UseAuthorization
app.UseCors("AllowFrontend");

// Configure static files middleware to serve uploaded files
app.UseStaticFiles();

app.UseRouting();

// Print middleware registration for debugging
Console.WriteLine("Registering authentication and authorization middleware");

app.UseAuthentication();
app.UseAuthorization();

// Add our custom Auth middleware for logging/debugging
app.UseAuthMiddleware();

app.MapControllers();

app.Run();