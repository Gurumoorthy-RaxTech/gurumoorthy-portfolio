# EmployeeDeptApi.DapperAdo — Stored Procedures + Dapper + ADO.NET (Interview Ready)

A second .NET 9 Web API, reusing the same `Employee` / `Department` tables in the
`SchoolTest` database (created earlier by the sibling `EmployeeDeptApi` EF Core
project), but doing **all data access through Stored Procedures** — called two
different ways so you can explain and demo both:

- `/api/dapper/*` → Dapper (micro-ORM) calling the stored procedures
- `/api/ado/*` → raw ADO.NET (`SqlConnection` / `SqlCommand` / `SqlDataReader`) calling the same stored procedures

Both routes implement the exact same `IDepartmentRepository` / `IEmployeeRepository`
contract, so the controller code is nearly identical — only the repository
*implementation* differs. That's the whole point: **the data-access technology is an
implementation detail hidden behind an interface.**

---

## Step-by-step: how this was built (say this out loud in the interview)

### Step 1 — Write the stored procedures
File: [`Database/StoredProcedures.sql`](Database/StoredProcedures.sql)

12 procedures total — 7 for Department, 5 core + helpers for Employee:

```
sp_Department_GetAll / GetById / Insert / Update / Delete / NameExists / HasEmployees
sp_Employee_GetAll   / GetById / Insert / Update / Delete / EmailExists
```

Key patterns used, worth explaining if asked:
- **`SET NOCOUNT ON`** — suppresses the "N rows affected" message SQL Server sends
  after DML, which otherwise can confuse ADO.NET readers / add network overhead.
- **`OUTPUT` parameter for inserts** (`@NewDepartmentId`, `@NewEmployeeId`) — set via
  `SCOPE_IDENTITY()`, so the caller gets the new identity value back without a second
  round-trip `SELECT`.
- **`sp_Employee_GetAll` joins to Departments** — so the API doesn't need N+1 queries
  to show the department name per employee.
- **Guarded `DROP PROCEDURE IF EXISTS` before every `CREATE`** — makes the script
  idempotent; safe to re-run after editing a procedure.

Run it once against the DB:
```bash
sqlcmd -S 192.168.1.52 -U SchoolCloud -P "School@123" -d SchoolTest -C -i Database/StoredProcedures.sql
```
(This was already run — the 12 procedures exist in `SchoolTest` right now.)

**Why stored procedures at all (they will ask this):**
- Precompiled execution plan cached by SQL Server → faster on repeated calls.
- SQL logic lives in the database, versioned/reviewed independently of the app.
- Reduces surface area for SQL injection — parameters are always typed, never
  string-concatenated.
- Downside they'll expect you to mention: harder to source-control/diff cleanly
  alongside app code, and business logic split across two codebases (DB + app) can
  get confusing if overused.

### Step 2 — Add the NuGet packages
```bash
dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient
```
`Dapper` is the micro-ORM. `Microsoft.Data.SqlClient` is the actual ADO.NET driver —
Dapper is built as *extension methods on top of* `IDbConnection`, so both approaches
ultimately go through this same driver.

### Step 3 — One shared connection factory for both approaches
Files: [`Data/IDbConnectionFactory.cs`](Data/IDbConnectionFactory.cs),
[`Data/SqlConnectionFactory.cs`](Data/SqlConnectionFactory.cs)

```csharp
public interface IDbConnectionFactory { IDbConnection CreateConnection(); }
```
Both the Dapper repos and the ADO.NET repos ask this factory for a connection instead
of `new SqlConnection(...)` directly — Single Responsibility (only one class knows the
connection string) and it means either repo type can be unit-tested with a fake
factory.

### Step 4 — Define ONE repository contract
Files: [`Repositories/Interfaces/IDepartmentRepository.cs`](Repositories/Interfaces/IDepartmentRepository.cs),
[`Repositories/Interfaces/IEmployeeRepository.cs`](Repositories/Interfaces/IEmployeeRepository.cs)

This interface doesn't know or care whether it's backed by Dapper or ADO.NET.

### Step 5 — Implement it with Dapper
Files: [`Repositories/Dapper/DapperDepartmentRepository.cs`](Repositories/Dapper/DapperDepartmentRepository.cs),
[`Repositories/Dapper/DapperEmployeeRepository.cs`](Repositories/Dapper/DapperEmployeeRepository.cs)

The core pattern, every method follows this shape:
```csharp
using var connection = _connectionFactory.CreateConnection();
return await connection.QueryAsync<Department>(
    "sp_Department_GetAll",
    commandType: CommandType.StoredProcedure);
```
- `QueryAsync<T>` → maps every result row onto `T` by column name automatically
  (reflection + compiled IL under the hood, cached per type).
- `ExecuteAsync` → for INSERT/UPDATE/DELETE, returns rows affected.
- `ExecuteScalarAsync<T>` → for single-value results (`NameExistsAsync` returns `bool`).
- **`DynamicParameters` with `ParameterDirection.Output`** → how you read back an
  `OUTPUT` parameter (see `InsertAsync` — reads `NewDepartmentId` after `ExecuteAsync`
  completes).
- Anonymous objects (`new { DepartmentId = id }`) become the SP's parameters — Dapper
  matches property names to `@ParameterName`.

**What Dapper does NOT do (important distinction from EF Core):**
No change tracking, no LINQ-to-SQL translation, no lazy loading, no automatic
migrations. You write every query/SP call by hand. That's the tradeoff for its speed
and simplicity.

### Step 6 — Implement the exact same contract with raw ADO.NET
Files: [`Repositories/Ado/AdoDepartmentRepository.cs`](Repositories/Ado/AdoDepartmentRepository.cs),
[`Repositories/Ado/AdoEmployeeRepository.cs`](Repositories/Ado/AdoEmployeeRepository.cs)

The core pattern here is the "long form" of what Dapper does internally:
```csharp
using var connection = (SqlConnection)_connectionFactory.CreateConnection();
using var command = new SqlCommand("sp_Department_GetAll", connection)
{
    CommandType = CommandType.StoredProcedure
};

await connection.OpenAsync();
using var reader = await command.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    results.Add(MapDepartment(reader));   // manual column-by-column mapping
}
```
Things to call out as differences from Dapper:
- **You must call `connection.OpenAsync()` yourself** — Dapper opens the connection
  for you implicitly on first use.
- **Every parameter is built by hand**: `new SqlParameter("@Name", SqlDbType.NVarChar, 100) { Value = ... }`,
  including explicit `DBNull.Value` for nulls (a very common ADO.NET bug source if
  forgotten — passing C# `null` directly throws).
- **Mapping is manual**: `reader.GetInt32(reader.GetOrdinal("DepartmentId"))`, with an
  `IsDBNull` check before reading any nullable column.
- **`OUTPUT` parameters** are just a `SqlParameter` with `Direction = ParameterDirection.Output`,
  added to `command.Parameters` before execution, read from `.Value` after
  `ExecuteNonQueryAsync()`.
- **Always wrap `SqlConnection`, `SqlCommand`, `SqlDataReader` in `using`** — they hold
  unmanaged resources (network sockets); forgetting this leaks connections and
  eventually exhausts the connection pool.

### Step 7 — Register both implementations with Keyed DI (.NET 8+)
File: [`Program.cs`](Program.cs)

Since two classes implement the same interface, plain `AddScoped<IDepartmentRepository, X>()`
can only point at one of them. **Keyed services** solve this:
```csharp
builder.Services.AddKeyedScoped<IDepartmentRepository, DapperDepartmentRepository>("dapper");
builder.Services.AddKeyedScoped<IDepartmentRepository, AdoDepartmentRepository>("ado");
```
And resolved in a controller constructor with:
```csharp
public DepartmentsDapperController([FromKeyedServices("dapper")] IDepartmentRepository repository)
```
This is a genuinely new (.NET 8+) DI feature — mentioning it unprompted is a good
signal you keep up with the framework.

### Step 8 — Controllers
Files: [`Controllers/DepartmentsDapperController.cs`](Controllers/DepartmentsDapperController.cs),
[`Controllers/DepartmentsAdoController.cs`](Controllers/DepartmentsAdoController.cs),
[`Controllers/EmployeesDapperController.cs`](Controllers/EmployeesDapperController.cs),
[`Controllers/EmployeesAdoController.cs`](Controllers/EmployeesAdoController.cs)

Open `DepartmentsDapperController.cs` and `DepartmentsAdoController.cs` side by side —
every method body is identical except the constructor's `[FromKeyedServices(...)]` key.
That's the payoff of coding to the interface.

### Step 9 — Run it
```bash
dotnet run
```
Open `/swagger` — you'll see both route groups: `dapper` and `ado`, each with full
Department/Employee CRUD.

---

## Quick comparison table (memorize this for the interview)

| | EF Core (see sibling project) | Dapper | Raw ADO.NET |
|---|---|---|---|
| Writes SQL for you | Yes (LINQ → SQL) | No — you write it | No — you write it |
| Result mapping | Automatic (change-tracked entities) | Automatic (POCO, no tracking) | Manual, column by column |
| Performance | Slowest (tracking + translation overhead) | Near-ADO.NET speed | Fastest (nothing in between you and the driver) |
| Boilerplate | Least | Medium | Most |
| Migrations | Built-in (`dotnet ef migrations`) | None — manage schema/SPs yourself | None |
| Best for | CRUD-heavy apps, rapid development | Performance-sensitive reads, complex reporting queries, calling existing SPs | Full control needed, or a dependency-free scenario |

**One-liner if asked "which would you pick?":** "EF Core for the bulk of CRUD where
developer speed matters; Dapper when a query needs to be fast or already exists as a
stored procedure and I just need to call it; raw ADO.NET only when I need something
Dapper doesn't give me — e.g. very fine-grained control over batching or bulk copy."

---

## SQL Injection note (they may probe this)

All three approaches here are injection-safe **because every value is passed as a
typed parameter** (`SqlParameter`, Dapper's anonymous object, or EF Core's LINQ
translation) — never string-concatenated into the SQL/SP name. If you ever see
`"EXEC sp_X '" + userInput + "'"` in code, that's the injection risk, not the choice of
Dapper vs ADO.NET vs EF Core itself.

---

## If asked "what would you add for production?"
- Wrap multi-step operations (e.g. transferring an employee between departments with
  side effects) in an explicit `SqlTransaction` / `connection.BeginTransactionAsync()`.
- Retry policy (Polly) around transient SQL connection failures.
- Move the connection string to a secrets store, not `appsettings.json`.
- Add the same JWT auth / middleware / filters shown in the sibling `EmployeeDeptApi`
  project — this project intentionally left those out to keep the Dapper/ADO.NET
  comparison the sole focus.
