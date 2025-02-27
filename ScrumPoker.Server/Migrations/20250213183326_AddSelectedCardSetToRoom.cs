using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumPoker.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSelectedCardSetToRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SelectedCardSet",
                table: "Rooms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SelectedCardSet",
                table: "Rooms");
        }
    }
}
