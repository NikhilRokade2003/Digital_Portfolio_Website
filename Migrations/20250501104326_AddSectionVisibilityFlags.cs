using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalPortfolioBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddSectionVisibilityFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEducationPublic",
                table: "Portfolios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsExperiencePublic",
                table: "Portfolios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsProjectsPublic",
                table: "Portfolios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSkillsPublic",
                table: "Portfolios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSocialMediaPublic",
                table: "Portfolios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEducationPublic",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "IsExperiencePublic",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "IsProjectsPublic",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "IsSkillsPublic",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "IsSocialMediaPublic",
                table: "Portfolios");
        }
    }
}
