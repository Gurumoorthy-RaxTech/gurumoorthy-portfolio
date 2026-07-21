# EmployeeDeptApi — .NET 9 Web API CRUD (Interview Ready)

A working ASP.NET Core Web API with Employee/Department CRUD against a real SQL Server
database, built to demonstrate the core interview topics: **Dependency Injection**,
**Middleware**, **Filters**, **SOLID principles**, and **JWT Authentication**.

Tables were created and tested live against:
`Data Source=192.168.1.52` / DB `SchoolTest` (see `appsettings.json` → `ConnectionStrings:DefaultConnection`).

---

## 1. Run it

```bash
cd EmployeeDeptApi
dotnet restore
dotnet ef database update   # only needed first time / after model changes
dotnet run
```

Open `https://localhost:<port>/swagger` (URL is printed in the console).

**Login first** (all Employee/Department endpoints require a JWT):

```
POST /api/auth/login
{ "username": "admin", "password": "admin123" }
```

Copy the returned `token`, click **Authorize** in Swagger, enter `Bearer <token>`.

---

## 2. Project structure (why it's laid out this way)

```
Models/          -> EF Core entities (Employee, Department)
DTOs/            -> Request/response shapes — never expose entities directly
Data/            -> AppDbContext (EF Core)
Repositories/    -> Data access abstraction (Generic + specific repos)
Services/        -> Business logic, sits between Controllers and Repositories
Auth/            -> JWT settings + token generation
Middleware/      -> Custom pipeline components (exception handling, logging)
Filters/         -> MVC action filters (logging, model validation)
Controllers/     -> Thin HTTP layer — delegates to Services
```

This is a **layered architecture**: `Controller -> Service -> Repository -> DbContext`.
Each layer only knows about the one below it through an **interface**, which is exactly
what makes the DI / SOLID story below possible.

---

## 3. Dependency Injection (DI) — where to point in the code

**Definition to say out loud:** "DI is a technique where an object's dependencies are
provided by an external container instead of the object creating them itself. ASP.NET
Core has a built-in IoC container that resolves constructor parameters automatically."

**Show this:**
- [`Program.cs`](Program.cs) — every `builder.Services.Add...` line is a DI **registration**.
  ```csharp
  builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
  builder.Services.AddScoped<IEmployeeService, EmployeeService>();
  builder.Services.AddScoped<ITokenService, TokenService>();
  ```
- [`Controllers/EmployeesController.cs`](Controllers/EmployeesController.cs) — constructor
  takes `IEmployeeService`, never `new EmployeeService()`. The container injects it. This
  is **Constructor Injection**, the most common form.
- [`Services/EmployeeService.cs`](Services/EmployeeService.cs) — same pattern, depends on
  `IEmployeeRepository` / `IDepartmentRepository`, not on EF Core directly.

**Service lifetimes (they will ask this):**
| Lifetime | Meaning | Used here for |
|---|---|---|
| `Transient` | New instance every time it's requested | Lightweight, stateless helpers |
| `Scoped` | One instance per HTTP request | Repositories, Services, DbContext (default) |
| `Singleton` | One instance for the app's lifetime | Config objects, caches |

We use `Scoped` everywhere because `AppDbContext` is scoped — a repository holding a
`DbContext` must share that same scope, or you get "second operation started on this
context" errors.

**Follow-up they love to ask:** *"Why not just `new` it up?"* → Tight coupling makes
unit testing impossible (can't mock a `new`'d class), and it violates the Dependency
Inversion Principle (see SOLID below).

---

## 4. Middleware — where to point

**Definition:** "Middleware are components assembled into a pipeline that handle
requests and responses. Each one can act before and after calling the next component,
or short-circuit the pipeline entirely."

**Show this:**
- [`Middleware/ExceptionHandlingMiddleware.cs`](Middleware/ExceptionHandlingMiddleware.cs) —
  wraps `await _next(context)` in try/catch, converts any unhandled exception into a
  clean JSON 500 response instead of leaking a stack trace.
- [`Middleware/RequestLoggingMiddleware.cs`](Middleware/RequestLoggingMiddleware.cs) —
  logs method, path, status code, and elapsed time for every request.
- [`Program.cs`](Program.cs) — the pipeline **order**:
  ```csharp
  app.UseCustomExceptionHandler();  // must be first: catches errors from everything after it
  app.UseRequestLogging();
  app.UseSwagger();
  app.UseHttpsRedirection();
  app.UseAuthentication();          // who are you
  app.UseAuthorization();           // are you allowed
  app.MapControllers();
  ```

**Key talking point — order matters.** Middleware is a chain of responsibility: each
one calls `next()` to pass control forward. If `UseAuthentication` were placed after
`MapControllers`, `[Authorize]` would never see an identity. Exception handling has to
be registered *first* so it can catch errors thrown by everything downstream.

**Middleware vs Filters (common trick question):** Middleware operates on the raw
`HttpContext` for *every* request, framework-agnostic (works even if you're not using
MVC). Filters operate *inside* the MVC action-invocation pipeline and have access to
MVC-specific context (model binding results, action arguments, `ActionResult`).

---

## 5. Filters — where to point

**Definition:** "Filters let you run code at specific stages of the MVC action pipeline
— before/after model binding, before/after the action executes, before/after the
result is written, or when an exception occurs — without repeating that logic in every
controller."

**Show this:**
- [`Filters/LogActionFilter.cs`](Filters/LogActionFilter.cs) — `IActionFilter`, logs
  action name + arguments before execution, and the result type after.
- [`Filters/ValidateModelFilter.cs`](Filters/ValidateModelFilter.cs) — `IActionFilter`
  that checks `ModelState.IsValid` and short-circuits with `400 Bad Request` if not,
  so controllers don't repeat `if (!ModelState.IsValid) return BadRequest(...)` everywhere.
- Applied via attributes on the controllers:
  ```csharp
  [ServiceFilter(typeof(LogActionFilter))]   // resolved from DI (has ILogger dependency)
  [TypeFilter(typeof(ValidateModelFilter))]  // instantiated fresh, no DI dependencies needed
  ```

**Filter types (rattle these off if asked):**
`Authorization Filters` → `Resource Filters` → `Action Filters` → `Exception Filters` →
`Result Filters`, running in that order around the action call. `[Authorize]` itself is
an Authorization Filter.

**`ServiceFilter` vs `TypeFilter` vs plain attribute:** `ServiceFilter` resolves the
filter instance from the DI container (needed here because `LogActionFilter` takes an
`ILogger` in its constructor). `TypeFilter` also supports DI but creates the instance
via `ActivatorUtilities` rather than requiring it to be registered in `Program.cs`.

---

## 6. SOLID Principles — where to point

| Principle | Where it's demonstrated |
|---|---|
| **S** — Single Responsibility | `EmployeeService` only handles employee business rules; `EmployeeRepository` only handles data access; `TokenService` only builds JWTs. Each class has one reason to change. |
| **O** — Open/Closed | [`Repositories/Interfaces/IEmployeeRepository.cs`](Repositories/Interfaces/IEmployeeRepository.cs) *extends* `IGenericRepository<Employee>` with extra methods instead of modifying `GenericRepository<T>`. New entity-specific behavior is added without touching existing generic code. |
| **L** — Liskov Substitution | Anywhere `IGenericRepository<T>` is expected, `EmployeeRepository`/`DepartmentRepository` can be substituted without breaking behavior — they honor the same contract. |
| **I** — Interface Segregation | Controllers depend on narrow, purpose-specific interfaces (`IEmployeeService`, `IDepartmentService`) instead of one giant "do everything" interface. |
| **D** — Dependency Inversion | `EmployeeService` depends on `IEmployeeRepository`/`IDepartmentRepository` (abstractions), never on `EmployeeRepository` or `AppDbContext` directly. High-level modules (Services) don't depend on low-level modules (EF Core); both depend on abstractions. This is *what makes DI in section 3 possible*. |

**One-liner if put on the spot:** "SOLID and DI aren't separate things — DI is the
*mechanism*, Dependency Inversion is the *principle* that tells you which abstractions
to inject."

---

## 7. JWT Authentication — where to point

**Definition:** "JWT is a self-contained, signed token. The server issues it after
verifying credentials; the client sends it on every subsequent request in the
`Authorization: Bearer <token>` header; the server verifies the signature and claims
without needing a server-side session store — that's what makes it stateless."

**Show this, in order:**
1. [`appsettings.json`](appsettings.json) — `JwtSettings` section: `Key`, `Issuer`,
   `Audience`, `ExpiryMinutes`.
2. [`Auth/TokenService.cs`](Auth/TokenService.cs) — builds a `JwtSecurityToken` with
   claims (`sub`, `name`, `role`), signs it with `HmacSha256` using the symmetric key.
3. [`Controllers/AuthController.cs`](Controllers/AuthController.cs) —
   `POST /api/auth/login` validates credentials (hardcoded `admin`/`admin123` for this
   demo — swap for a real Users table + hashed passwords in production) and returns the
   token.
4. [`Program.cs`](Program.cs) — `AddAuthentication().AddJwtBearer(...)` registers the
   handler that validates incoming tokens on every request: checks issuer, audience,
   signing key, and expiry (`TokenValidationParameters`).
5. `[Authorize]` on [`EmployeesController`](Controllers/EmployeesController.cs) and
   [`DepartmentsController`](Controllers/DepartmentsController.cs) — rejects any request
   without a valid token with `401 Unauthorized`.

**Flow to describe out loud:**
`Client -> POST /api/auth/login -> server validates creds -> signs JWT -> client stores
token -> client sends "Authorization: Bearer <token>" on every request ->
UseAuthentication() validates signature/expiry -> UseAuthorization() checks [Authorize]
-> controller runs.`

**Common follow-ups:**
- *"Where's the secret stored?"* → `appsettings.json` here for demo simplicity; in
  production, Azure Key Vault / environment variables / `dotnet user-secrets` — never
  committed to source control.
- *"How do you revoke a JWT before it expires?"* → You generally can't (that's the
  tradeoff for being stateless) — mitigate with short expiry + refresh tokens, or a
  server-side blocklist for high-security cases.
- *"Authentication vs Authorization?"* → Authentication = who are you (login/JWT
  validation). Authorization = what are you allowed to do (`[Authorize]`, roles,
  policies).

---

## 8. Quick CRUD walkthrough (for a live demo)

```
POST   /api/auth/login          -> get JWT
GET    /api/departments         -> list (seeded: Engineering, HR, Finance)
POST   /api/departments         -> create
GET    /api/employees           -> list with department name joined in
POST   /api/employees           -> create (validates DepartmentId exists, Email unique)
PUT    /api/employees/{id}      -> update
DELETE /api/employees/{id}      -> delete
```

Business rules worth mentioning if asked "what happens when...":
- Creating an employee with a non-existent `DepartmentId` → `400 Bad Request`.
- Duplicate employee email → `400 Bad Request`.
- Deleting a department that still has employees → `400 Bad Request` (referential
  integrity enforced in the service layer, not just the DB FK).

---

## 9. If they ask "what would you add for production?"

- Real user store + password hashing (`BCrypt`/`Identity`) instead of hardcoded login.
- Refresh tokens.
- FluentValidation instead of data-annotation validation for complex rules.
- Global `ProblemDetails` response shape (RFC 7807) instead of ad-hoc `{ message }`.
- Rate limiting middleware, CORS policy, health checks.
- Serilog + structured logging sink instead of console logging.
- Unit tests: mock `IEmployeeRepository` to test `EmployeeService` in isolation
  (that's the whole point of the DI/interface layering — it's testable without a DB).
