using System.ComponentModel.DataAnnotations;

namespace CodeFirstDemo.Models
{
    // CODE-FIRST: this class is the SOURCE OF TRUTH. There is no "Products" table
    // anywhere yet - EF Core reads this class (plus the Fluent API rules in
    // AppDbContext.OnModelCreating) and GENERATES the table for us via a migration.
    //
    // A couple of properties use Data Annotations (the [Required] / [MaxLength]-style
    // attributes you see on Id/Name here) just to show that approach exists too, but
    // the more complete configuration for this same class lives in AppDbContext's
    // Fluent API (OnModelCreating) - see the note there for why Fluent API tends to
    // win in real projects.
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Stock { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
