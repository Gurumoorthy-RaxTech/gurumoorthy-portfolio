using AdoNetDemo.Repositories;
using Microsoft.Extensions.Configuration;

// Reads the "SchoolDb" entry out of appsettings.json at startup - the .NET 8
// console-app equivalent of ConfigurationManager.ConnectionStrings["SchoolDb"]
// against App.config in sibling project 01.
//
// appsettings.json (committed) only has a placeholder - the real connection
// string lives in appsettings.Development.json, which is gitignored and never
// committed. See README.txt for how to create your own local copy.
IConfiguration config = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: false)
    .Build();

string connectionString = config.GetConnectionString("SchoolDb")
    ?? throw new InvalidOperationException("Connection string 'SchoolDb' was not found in appsettings.json.");

if (connectionString.StartsWith("<SET_IN_"))
    throw new InvalidOperationException(
        "SchoolDb connection string is still the placeholder from appsettings.json. " +
        "Create appsettings.Development.json with your real local connection string - see README.txt.");

var repo = new ProductRepository(connectionString);

Console.WriteLine("ADO.NET Stored Procedure / View / Trigger Demo");
Console.WriteLine("================================================");
Console.WriteLine();

// ---------------------------------------------------------------------
// Step 1: INSERT a new product. This is plain parameterized ADO.NET SQL
// text - but it also fires trg_Product_Insert (AFTER INSERT) behind the
// scenes, which writes a row into ProductAudit as a side effect. No C#
// code below inserts into ProductAudit directly.
// ---------------------------------------------------------------------
Console.WriteLine("=== Step 1: Insert (fires trigger) ===");
int newProductId = repo.InsertProduct("USB Cable", price: 5.00m, stock: 5);
Console.WriteLine($"Inserted new Product. New ProductId = {newProductId}");
Console.WriteLine();

// ---------------------------------------------------------------------
// Step 2: Read back ProductAudit for the product we just inserted. If the
// trigger fired correctly, there will be exactly one 'INSERT' row here -
// and we never wrote it ourselves, so this row is proof the trigger ran.
// ---------------------------------------------------------------------
Console.WriteLine("=== Step 2: Read audit trail (proves the trigger fired) ===");
var auditTrail = repo.GetAuditTrail(newProductId);
if (auditTrail.Count == 0)
{
    Console.WriteLine("No audit rows found - the trigger did not fire (check that CreateSchemaObjects.sql ran).");
}
else
{
    foreach (var entry in auditTrail)
    {
        Console.WriteLine($"AuditId={entry.AuditId}, ProductId={entry.ProductId}, Action={entry.Action}, ActionDate={entry.ActionDate:yyyy-MM-dd HH:mm:ss}");
    }
}
Console.WriteLine();

// ---------------------------------------------------------------------
// Step 3: Look the product back up via the stored procedure sp_GetProductById
// (CommandType.StoredProcedure + a SqlParameter), not inline SQL text.
// ---------------------------------------------------------------------
Console.WriteLine("=== Step 3: Get product via stored procedure (sp_GetProductById) ===");
var product = repo.GetProductById(newProductId);
if (product is null)
{
    Console.WriteLine($"No product found with ProductId={newProductId}.");
}
else
{
    Console.WriteLine($"ProductId={product.ProductId}, Name={product.Name}, Price={product.Price:C}, Stock={product.Stock}");
}
Console.WriteLine();

// ---------------------------------------------------------------------
// Step 4: Query the vw_LowStockProducts view. The product just inserted has
// Stock=5, which is < 10, so it should show up in this list.
// ---------------------------------------------------------------------
Console.WriteLine("=== Step 4: Get low-stock products via view (vw_LowStockProducts) ===");
var lowStock = repo.GetLowStockProducts();
if (lowStock.Count == 0)
{
    Console.WriteLine("No low-stock products found.");
}
else
{
    foreach (var p in lowStock)
    {
        Console.WriteLine($"ProductId={p.ProductId}, Name={p.Name}, Price={p.Price:C}, Stock={p.Stock}");
    }
}
Console.WriteLine();

Console.WriteLine("Demo complete.");
