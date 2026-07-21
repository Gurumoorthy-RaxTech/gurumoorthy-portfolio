EFCore_CodeFirst_DatabaseFirst_Demo - EF Core Code-First AND Database-First, side by side (.NET 8)
====================================================================================================

WHAT THIS DEMONSTRATES
  The two ways you set up an EF Core DbContext in a real project, built as two
  separate, independently-runnable console apps in one solution so they can
  be compared directly:

    CodeFirstDemo       - C# classes come FIRST, EF Core generates the schema
    DatabaseFirstDemo    - the database table comes FIRST, EF Core generates
                           the C# classes from it (via scaffolding)

  Both are genuinely built, migrated/scaffolded, run, and verified against a
  real database - not just written and assumed to work. See "WHAT WAS
  ACTUALLY VERIFIED" below for exactly what ran and what it printed.

WHY THE TWO SUB-PROJECTS USE TWO DIFFERENT DATABASES
  This is deliberate, not an inconsistency:

    CodeFirstDemo   -> local SQLite file (CodeFirstDemo.db)
    DatabaseFirstDemo -> the real dev SQL Server (192.168.1.52/SchoolTest)

  Code-First means EF Core CREATES the schema from your classes by running
  migrations against whatever connection string you give it. `dotnet ef
  database update` is a WRITE operation (it runs CREATE TABLE etc.). Pointing
  a demo project's migrations at a shared team/production-adjacent SQL Server
  by default is exactly the kind of thing you don't want to do automatically -
  so CodeFirstDemo targets a local SQLite file instead. That gives a fully
  real, fully verified Code-First workflow (entity classes -> migration ->
  `dotnet ef database update` -> an actual .db file appears on disk) with zero
  external side effects, zero shared credentials, and zero risk, because the
  workflow itself is provider-agnostic - the entity classes, the Fluent API
  config, and the migration commands are identical no matter which database
  you point them at.

  Swapping CodeFirstDemo to SQL Server for a real interview demo is a one-line
  change - in Data/AppDbContext.cs, replace:
    optionsBuilder.UseSqlite("Data Source=CodeFirstDemo.db");
  with:
    optionsBuilder.UseSqlServer("Server=192.168.1.52;Database=SchoolTest;User ID=SchoolCloud;Password=<YOUR_PASSWORD_HERE>;TrustServerCertificate=True;");
  then delete the Migrations folder and re-run `dotnet ef migrations add
  InitialCreate` + `dotnet ef database update`. Nothing else in the project
  changes.

  DatabaseFirstDemo, by contrast, uses `dotnet ef dbcontext scaffold`, which is
  READ-ONLY schema reflection - it queries SQL Server system catalog views
  (sys.tables, sys.columns, sys.indexes, ...) to discover a table that ALREADY
  EXISTS and generates C# classes from it. It does not create, alter, or
  write any data, so it's safe to point at the real shared dev server, and
  doing that against real data is the whole point of the demo (Database-First
  only makes sense against a database that's already there).

WHAT WAS ACTUALLY VERIFIED (this is not hypothetical - both of these ran)

  CodeFirstDemo:
    1. `dotnet ef migrations add InitialCreate` generated Migrations/
       20260718071412_InitialCreate.cs from the Product class + Fluent API.
    2. `dotnet ef database update` applied it and created a real file,
       CodeFirstDemo.db, in this folder (confirmed on disk afterwards).
    3. `dotnet run` opened that file, found the Products table empty, seeded
       3 rows, and printed them back out. Running it a second time correctly
       detected existing data and skipped seeding. Both runs' console output
       is exactly what a live demo would show.

  DatabaseFirstDemo:
    1. Connectivity to 192.168.1.52:1433 was tested first (TCP connect
       succeeded) before attempting anything.
    2. `dotnet ef dbcontext scaffold ... --table "Student.Student" -f` was run
       for real against the live SchoolTest database and succeeded, producing
       Data/SchoolTestContext.cs and Models/Student.cs from the ACTUAL table
       schema (long StudentId, string? FirstName/LastName, long SchoolId,
       DateTime? CreatedDate, etc. - see Models/Student.cs for the full list).
       This is genuine scaffold output, not hand-written.
    3. The very first scaffold attempt (no schema qualifier, just `--table
       Student`) came back "Unable to find a table in the database matching
       the selected table 'dbo.Student'" - because on this server the table
       actually lives under a `Student` SCHEMA, not the default `dbo` schema
       (`Student.Student`, i.e. schema.table are both called "Student"). That
       failure and fix is left documented in the comment at the top of
       Data/SchoolTestContext.cs because "what do you do when scaffold can't
       find your table" is a realistic thing to be asked about.
    4. `dotnet run` opened SchoolTestContext, ran `db.Students.Count()`
       (8,794 rows at the time this was verified) and printed the first 5
       rows ordered by StudentId - real data, not sample/seed data. If this
       project is ever built or run somewhere that can't reach 192.168.1.52,
       Program.cs catches that and prints a clear message instead of crashing
       - the build/compile step never depends on live connectivity, only the
       one query at runtime does.
    NOTE ON AppUser: the task this project was built from mentioned an
    AppUser table (expected to exist from a sibling project's login demo).
    It does not actually exist on this server - sibling project 04
    (LoginJWT_StudentList_API_MVC_WinForms) never got past its initial
    scaffold stub, so no AppUser table was ever created. Rather than
    hand-write a fictional AppUser scaffold output and label it as real, this
    demo scaffolds only Student.Student, which does exist and was
    successfully scaffolded and queried for real - see above.

DATABASE
  CodeFirstDemo:    local SQLite file, CodeFirstDemo/CodeFirstDemo.db
                     (created by `dotnet ef database update`, not committed
                     as "real data" - it's fully reproducible from the
                     Migrations folder any time)
  DatabaseFirstDemo: Server=192.168.1.52, Database=SchoolTest,
                     User ID=SchoolCloud, Password=<YOUR_PASSWORD_HERE>,
                     TrustServerCertificate=True
                     (same dev SQL Server the other SampleProjects use -
                     read-only for this project's purposes)

HOW TO RUN

  CodeFirstDemo (from EFCore_CodeFirst_DatabaseFirst_Demo/CodeFirstDemo):
    1. dotnet ef migrations add InitialCreate   (already done - Migrations/
       folder is included; re-run only if you change Product/AppDbContext)
    2. dotnet ef database update                (creates/updates CodeFirstDemo.db)
    3. dotnet run                                (seeds 2-3 products on first
                                                   run, then prints all rows)

  DatabaseFirstDemo (from EFCore_CodeFirst_DatabaseFirst_Demo/DatabaseFirstDemo):
    1. (Already scaffolded - Data/SchoolTestContext.cs and Models/Student.cs
       are included.) To regenerate from scratch:
         dotnet ef dbcontext scaffold "Server=192.168.1.52;Database=SchoolTest;User ID=SchoolCloud;Password=<YOUR_PASSWORD_HERE>;TrustServerCertificate=True;" ^
           Microsoft.EntityFrameworkCore.SqlServer -o Models -c SchoolTestContext --context-dir Data --table "Student.Student" -f
    2. dotnet run   (connects, prints row count + first 5 Student rows; if the
       server isn't reachable it prints a clear connectivity message instead
       of crashing - see Program.cs)

  Or build/verify both at once from the base folder:
    dotnet build EFCoreDemo.sln

CODE-FIRST vs DATABASE-FIRST, SIDE BY SIDE

  Code-First workflow:
    1. Write plain C# classes (Models/Product.cs)
    2. Configure them - Data Annotations for the simple stuff, Fluent API in
       OnModelCreating for anything richer (this project uses BOTH: [Required]
       on Product.Name via annotation, plus HasMaxLength/HasColumnType via
       Fluent API in AppDbContext, specifically to show both approaches and
       why Fluent API is usually preferred for real config: it keeps mapping
       concerns out of the POCO, and some things - composite keys, decimal
       precision, value conversions - can ONLY be done via Fluent API)
    3. `dotnet ef migrations add <Name>` - EF Core diffs your model against
       the last migration snapshot and generates a migration class describing
       the schema change (CREATE TABLE, ADD COLUMN, etc. as C# Up()/Down())
    4. `dotnet ef database update` - actually applies that migration to a
       real database, creating/altering tables to match your classes
    You never write SQL DDL by hand. The classes are the source of truth.

  Database-First workflow:
    1. The table already exists (created by someone else, another team, a
       previous project - here, Student.Student on the shared dev server)
    2. `dotnet ef dbcontext scaffold <connection-string> <provider> -o Models
       -c <ContextName> --context-dir Data [--table Schema.Table]` - EF Core
       reads the database's system catalog views (NOT your C# code - there is
       no C# code yet) and GENERATES a DbContext + POCO classes that match
       what it found: column names, types, nullability, indexes, keys, even
       default values (see HasDefaultValueSql("(getdate())") on CreatedDate
       in SchoolTestContext.cs - that's a real default constraint EF Core
       discovered on the actual column)
    3. You use the generated classes as-is, or extend them via the generated
       `partial` classes/OnModelCreatingPartial hook without touching the
       generated file directly (so re-running scaffold later doesn't clobber
       your customizations)
    The database is the source of truth. The classes are a reflection of it.

  Same DbSet<T>/LINQ/SaveChanges() programming model either way once you have
  a DbContext - the only real difference is which direction the "truth"
  flows: classes -> DB (Code-First) or DB -> classes (Database-First).

WHAT ABOUT EDMX?
  If you've used EF6 on .NET Framework, "Database-First" probably means the
  classic `.edmx` file: Project -> Add -> New Item -> ADO.NET Entity Data
  Model, which launches a wizard in Visual Studio - pick a connection, pick
  which tables/views/stored procs to include, and the wizard generates an
  .edmx XML file (a visual diagram of your entities AND the mapping/storage
  model) plus .tt (T4) text-template files that code-gen your entity classes
  from that XML whenever it changes.

  That whole .edmx + wizard experience is a Visual-Studio-GUI-driven feature.
  There's no meaningful way to hand-author a real .edmx file outside the
  Designer - it's a specific XML schema (CSDL/SSDL/MSL sections) that the
  Designer's UI and the wizard maintain together, and EF6/.edmx isn't even
  supported on EF Core / .NET Core+ at all - Microsoft deliberately dropped
  the visual designer when EF Core was built.

  `dotnet ef dbcontext scaffold` (this project's DatabaseFirstDemo) is the
  direct modern equivalent of what the EDMX wizard used to do for
  Database-First: same end result - an existing database reverse-engineered
  into C# classes you can query with LINQ - just:
    - a different EF generation (EF Core vs EF6)
    - different tooling (a CLI command you can run/re-run/script/put in a
      README, vs a GUI wizard you click through in Visual Studio)
    - no visual designer surface and no .edmx XML file - you get plain C#
      classes + a DbContext directly, no intermediate diagram/mapping file
  If an interviewer asks "how do you do Database-First without the EDMX
  designer" - this is the answer: `dotnet ef dbcontext scaffold`, which is
  exactly what's demonstrated (and was actually run, against a real table)
  in DatabaseFirstDemo.

PROJECT LAYOUT
  EFCoreDemo.sln
  CodeFirstDemo/
    CodeFirstDemo.db                      - real local SQLite file, created by
                                             `dotnet ef database update`
    Models/Product.cs                     - Id, Name, Price, Stock, CreatedDate
    Data/AppDbContext.cs                  - DbSet<Product>, OnConfiguring
                                             (SQLite), Fluent API in
                                             OnModelCreating
    Migrations/                           - InitialCreate migration + model
                                             snapshot, generated by
                                             `dotnet ef migrations add`
    Program.cs                            - opens the DB, seeds if empty,
                                             prints all products
  DatabaseFirstDemo/
    Data/SchoolTestContext.cs             - REAL scaffold output (see comment
                                             at top of the file for the exact
                                             command + what happened when it
                                             ran)
    Models/Student.cs                     - REAL scaffold output, matches the
                                             actual Student.Student table
    Program.cs                            - opens SchoolTestContext, prints
                                             row count + first 5 real rows (or
                                             a clear connectivity message if
                                             the server can't be reached)

See the chat response for the full build/verify transcript, including the
exact scaffold failure-then-fix (dbo.Student not found -> Student.Student)
and the real row counts/output from both `dotnet run`s.
