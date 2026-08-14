using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<SystemList> SystemList => Set<SystemList>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. กำหนด Default Schema เป็น "Core"
            modelBuilder.HasDefaultSchema("Core");

            // 2. แจ้ง EF Core ว่าตาราง AuditLogs มี Database Trigger
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs", "Core", tb => tb.HasTrigger("Trg_AutoCleanup_AuditLogs"));
            });

            // 3. Configure Unique Constraint for EmpId
            modelBuilder.Entity<User>()
                .HasIndex(u => u.EmpId)
                .IsUnique();

            // 4. Configure Composite Unique Constraint for Permission (UserId + SystemId)
            modelBuilder.Entity<Permission>()
                .HasIndex(p => new { p.UserId, p.SystemId })
                .IsUnique();
        }
    }
}