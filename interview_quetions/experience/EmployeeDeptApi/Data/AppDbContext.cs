using EmployeeDeptApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDeptApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Employee> Employees { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Department>()
                .HasIndex(d => d.Name)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Department>().HasData(
                new Department { DepartmentId = 1, Name = "Engineering", Location = "Chennai" },
                new Department { DepartmentId = 2, Name = "Human Resources", Location = "Bangalore" },
                new Department { DepartmentId = 3, Name = "Finance", Location = "Mumbai" }
            );
        }
    }
}
