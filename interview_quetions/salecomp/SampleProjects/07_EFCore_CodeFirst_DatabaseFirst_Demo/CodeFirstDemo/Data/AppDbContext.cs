using CodeFirstDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeFirstDemo.Data
{
    // CODE-FIRST DbContext.
    //
    // DATA SOURCE: a local SQLite file, CodeFirstDemo.db, created by running
    //   dotnet ef migrations add InitialCreate
    //   dotnet ef database update
    // in THIS project's folder. That second command is the one that actually
    // creates the .db file on disk - nothing here talks to the shared team SQL
    // Server, on purpose (see README "Why SQLite for Code-First" section).
    //
    // Swapping providers later is genuinely a one-line change: replace
    // UseSqlite(...) below with
    //   options.UseSqlServer("<your SchoolTest connection string - read from an env var/local config, never hardcode it>")
    // and re-run migrations add/update. Everything else - the Product class,
    // the Fluent API rules, the LINQ queries in Program.cs - stays identical,
    // because Code-First is provider-agnostic by design.
    public class AppDbContext : DbContext
    {
        public DbSet<Product> Products => Set<Product>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=CodeFirstDemo.db");
            }
        }

        // FLUENT API configuration. Data Annotations (see [Required] on
        // Product.Name) work fine for simple cases, but Fluent API is the more
        // powerful/complete option in real projects because:
        //   - it keeps ALL mapping concerns (column types, precision, indexes,
        //     relationships, keys) out of the POCO, so your entity classes stay
        //     plain and reusable outside of EF (DTOs, unit tests, etc.)
        //   - some things (composite keys, precision/scale on decimals, table
        //     splitting, value conversions) can ONLY be expressed via Fluent API,
        //     not via attributes
        // This is exactly the kind of "why Fluent API over Data Annotations"
        // question that comes up in EF Core interviews.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Name)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(p => p.Price)
                      .HasColumnType("decimal(10,2)");

                entity.Property(p => p.CreatedDate)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
}
