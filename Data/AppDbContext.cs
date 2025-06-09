using Microsoft.EntityFrameworkCore;
using DigitalPortfolioBackend.Models;

namespace DigitalPortfolioBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets for all models
        public DbSet<User> Users { get; set; }
        public DbSet<Portfolio> Portfolios { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Education> Educations { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<SocialMediaLink> SocialMediaLinks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
            });

            // Configure Portfolio entity
            modelBuilder.Entity<Portfolio>(entity =>
            {
                entity.ToTable("Portfolios");
                entity.HasKey(p => p.Id);
                entity.HasOne(p => p.User)
                    .WithMany(u => u.Portfolios)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Project entity
            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("Projects");
                entity.HasKey(p => p.Id);
                entity.HasOne(p => p.Portfolio)
                    .WithMany(p => p.Projects)
                    .HasForeignKey(p => p.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Education entity
            modelBuilder.Entity<Education>(entity =>
            {
                entity.ToTable("Educations");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Portfolio)
                    .WithMany(p => p.Educations)
                    .HasForeignKey(e => e.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Experience entity
            modelBuilder.Entity<Experience>(entity =>
            {
                entity.ToTable("Experiences");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Portfolio)
                    .WithMany(p => p.Experiences)
                    .HasForeignKey(e => e.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Skill entity
            modelBuilder.Entity<Skill>(entity =>
            {
                entity.ToTable("Skills");
                entity.HasKey(s => s.Id);
                entity.HasOne(s => s.Portfolio)
                    .WithMany(p => p.Skills)
                    .HasForeignKey(s => s.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SocialMediaLink entity
            modelBuilder.Entity<SocialMediaLink>(entity =>
            {
                entity.ToTable("SocialMediaLinks");
                entity.HasKey(s => s.Id);
                entity.HasOne(s => s.Portfolio)
                    .WithMany(p => p.SocialMediaLinks)
                    .HasForeignKey(s => s.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}