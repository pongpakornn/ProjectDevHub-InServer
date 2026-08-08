using Microsoft.EntityFrameworkCore;
using nondevhub_api.Models;

namespace nondevhub_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users", "Core").HasKey(u => u.UserId);
            modelBuilder.Entity<Permission>().ToTable("Permissions", "Core").HasKey(p => p.PermissionId);
            modelBuilder.Entity<AuditLog>().ToTable("AuditLogs", "Core").HasKey(a => a.LogId);

            modelBuilder.Entity<Permission>()
                .HasOne(p => p.User)
                .WithMany(u => u.Permissions)
                .HasForeignKey(p => p.UserId);
        }
    }
}