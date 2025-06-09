using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalPortfolioBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddContactInfoToPortfolio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Portfolios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Portfolios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Portfolios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Portfolios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Portfolios");
        }
    }
}
