using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Seed data so the app has something to show the moment it starts —
        // no manual "add a few rows" step needed before you can see it work.
        modelBuilder.Entity<Student>().HasData(
            new Student { Id = 1, Name = "Arjun Kumar", RollNumber = "10A-01", ClassName = "10-A", Email = "arjun@zencampus.edu", FeeDue = 0m, FeesPaid = true },
            new Student { Id = 2, Name = "Priya Sharma", RollNumber = "10A-02", ClassName = "10-A", Email = "priya@zencampus.edu", FeeDue = 5000m, FeesPaid = false },
            new Student { Id = 3, Name = "Karthik Raja", RollNumber = "10B-01", ClassName = "10-B", Email = "karthik@zencampus.edu", FeeDue = 2500m, FeesPaid = false }
        );
    }
}
