using Microsoft.EntityFrameworkCore;
using ScrumPoker.Server.Models;

namespace ScrumPoker.Server
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public required DbSet<Room> Rooms { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Room>().Property(r => r.Id).HasDefaultValueSql("NEWID()");
        }
    }
}
