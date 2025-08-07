using Kanban.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Kanban.Api.DTOs;

namespace Kanban.Api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

        public DbSet<Board> Boards { get; set; }
        public DbSet<Column> Columns { get; set; }
        public DbSet<Card> Cards { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Boards
            builder.Entity<Board>()
                .Property(b => b.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Entity<Board>()
                .Property(b => b.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()")
                .ValueGeneratedOnAddOrUpdate();

            // Cards
            builder.Entity<Card>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Entity<Card>()
                .Property(c => c.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()")
                .ValueGeneratedOnAddOrUpdate();

            // (existing cascade delete configs…)
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(ct);
        }

        private void UpdateTimestamps()
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries()
                .Where(e => e.Entity is Board || e.Entity is Card))
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("CreatedAt").CurrentValue = now;
                    entry.Property("UpdatedAt").CurrentValue = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    // keep original CreatedAt
                    entry.Property("UpdatedAt").CurrentValue = now;
                }
            }
        }
        public DbSet<Kanban.Api.DTOs.BoardDto> BoardDto { get; set; } = default!;
        public DbSet<Kanban.Api.DTOs.ColumnDto> ColumnDto { get; set; } = default!;
        public DbSet<Kanban.Api.DTOs.CardDto> CardDto { get; set; } = default!;

    }
}
