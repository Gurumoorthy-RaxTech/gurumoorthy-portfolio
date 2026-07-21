using CodeFirstDemo.Data;
using CodeFirstDemo.Models;

Console.WriteLine("=== EF Core CODE-FIRST demo (SQLite, local file CodeFirstDemo.db) ===");
Console.WriteLine();

using (var db = new AppDbContext())
{
    // Belt-and-braces: if someone runs this without having run the migrations
    // yet, create the database/schema from the current model so the demo still
    // works. Normally you'd run `dotnet ef database update` yourself first -
    // see README - but this makes `dotnet run` never blow up on a fresh clone.
    db.Database.EnsureCreated();

    if (!db.Products.Any())
    {
        Console.WriteLine("Products table is empty - seeding 3 sample rows...");
        db.Products.AddRange(
            new Product { Name = "Wireless Mouse", Price = 599.00m, Stock = 120, CreatedDate = DateTime.Now },
            new Product { Name = "Mechanical Keyboard", Price = 2499.50m, Stock = 45, CreatedDate = DateTime.Now },
            new Product { Name = "USB-C Hub", Price = 1299.00m, Stock = 80, CreatedDate = DateTime.Now }
        );
        db.SaveChanges();
        Console.WriteLine("Seed complete.");
    }
    else
    {
        Console.WriteLine("Products table already has data - skipping seed.");
    }

    Console.WriteLine();
    Console.WriteLine("Products currently in CodeFirstDemo.db:");
    Console.WriteLine("----------------------------------------");

    foreach (var p in db.Products.OrderBy(p => p.Id))
    {
        Console.WriteLine($"  [{p.Id}] {p.Name,-22} Price: {p.Price,10:C2}  Stock: {p.Stock,4}  Created: {p.CreatedDate:yyyy-MM-dd HH:mm}");
    }
}

Console.WriteLine();
Console.WriteLine("Done. This proves the full Code-First pipeline: C# classes -> migration -> ");
Console.WriteLine("real local SQLite database file -> seeded -> queried back out.");
