AdoNetDemo - Stored Procedure + View + Trigger via raw ADO.NET (.NET 8 console)
================================================================================

WHAT THIS DEMO SHOWS
  Three SQL Server objects that go beyond a plain table, each called from
  real C# ADO.NET code (SqlConnection/SqlCommand, no ORM):

  - TRIGGER (trg_Product_Insert)
      A block of SQL that the database runs automatically in response to an
      event - here, AFTER INSERT on the Product table. This demo uses it for
      auto-audit-logging: every time a product is inserted, the trigger
      writes a row into ProductAudit for you. The C# code never inserts into
      ProductAudit directly - it only inserts into Product, and the trigger
      does the rest. That's the point of a trigger: guaranteed side effects
      the application can't forget to perform.

  - VIEW (vw_LowStockProducts)
      A named, saved SELECT statement that behaves like a virtual table.
      Instead of every piece of code re-typing "WHERE Stock < 10", they all
      just SELECT * FROM vw_LowStockProducts. Centralizes the business rule
      ("low stock" = fewer than 10 units) in one place in the database.

  - STORED PROCEDURE (sp_GetProductById)
      A precompiled, named, parameterized block of SQL stored in the
      database. Called from C# with CommandType.StoredProcedure and a
      SqlParameter instead of inline SQL text - a common alternative to
      writing the SELECT directly in the application.

  Together these three cover a realistic scenario: insert a row, have the
  database automatically log that it happened (trigger), look the row back
  up through a reusable parameterized lookup (stored procedure), and list
  rows matching a saved business rule (view) - all from plain ADO.NET, no
  Entity Framework, no Dapper.

HOW TO RUN
  1. Open SSMS, connect to 192.168.1.52, and run Database\CreateSchemaObjects.sql
     against the SchoolTest database. This creates the Product table, the
     ProductAudit table, the trg_Product_Insert trigger, the
     vw_LowStockProducts view, the sp_GetProductById stored procedure, and
     seeds 3 sample rows (Notebook, Whiteboard Marker, Stapler).
  2. Open a terminal in the AdoNetDemo folder and run:
         dotnet run
  3. Read the console output top to bottom - it's a guided, labeled demo:
       Step 1: Inserts a new "USB Cable" product (this is what fires the trigger)
       Step 2: Reads ProductAudit back for that product - proves the trigger fired
       Step 3: Looks the product back up via sp_GetProductById - proves the SP works
       Step 4: Lists vw_LowStockProducts - proves the view works (USB Cable has
               Stock=5, which is < 10, so it will appear in the list)

NOTE ON REPEATED RUNS
  This demo actually WRITES to the real Product table on every run (Step 1
  always inserts a fresh row). Running `dotnet run` multiple times will
  insert multiple "USB Cable" rows, each with its own ProductId and its own
  audit trail - that's expected/fine for a demo like this, it just means the
  Product/ProductAudit tables will accumulate rows over time. Nothing is
  cleaned up automatically.

PROJECT LAYOUT
  Database/
    CreateSchemaObjects.sql   - run this FIRST in SSMS (table + audit table +
                                trigger + view + stored procedure + seed rows)
  AdoNetDemo/
    appsettings.json           - connection string lives here (ConnectionStrings:SchoolDb),
                                  the .NET 8 console-app equivalent of App.config's
                                  <connectionStrings> block in sibling project 01
    Program.cs                  - entry point; runs the 4-step guided demo script
    Models/Product.cs            - POCO matching the Product table/view columns
    Models/ProductAuditEntry.cs  - POCO matching the ProductAudit table columns
    Repositories/ProductRepository.cs - all raw ADO.NET SQL (SqlConnection/SqlCommand),
                                         InsertProduct / GetProductById (stored proc) /
                                         GetLowStockProducts (view) / GetAuditTrail

See the chat response for a full line-by-line explanation of the trigger,
view, stored procedure, and the ADO.NET code that calls each of them.
