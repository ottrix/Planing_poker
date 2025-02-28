using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumPoker.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSelectedCardSetIdToRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SelectedCardSet",
                table: "Rooms",
                newName: "SelectedCardSetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SelectedCardSetId",
                table: "Rooms",
                newName: "SelectedCardSet");
        }
    }
}
