# EmployeeDeptApi.WebApp — Razor Pages Login + Dashboard (Interview Ready)

A third project: a plain ASP.NET Core **Razor Pages** front-end (not calling the DB
directly) with two pages — **Login** and **Dashboard** — that consumes the JWT-secured
`EmployeeDeptApi` (project 1) over HTTP. This is the classic "front-end calls an
authenticated backend API" shape, tested live end-to-end.

---

## Step-by-step: how this was built

### Step 1 — Scaffold a Razor Pages app
```bash
dotnet new webapp -n EmployeeDeptApi.WebApp
```
`webapp` is the Razor Pages template (page-per-route, code-behind `.cshtml.cs`) — as
opposed to `mvc` (controller + shared views + routing table). Razor Pages is simpler
for a small, page-oriented UI like "one login page, one dashboard page."

### Step 2 — Decide how the front-end holds the JWT
The API issues a JWT on login. The front-end has to store it somewhere between
requests and attach it as `Authorization: Bearer <token>` on every API call it makes
on the user's behalf. Options, in order of production-readiness:

1. **Server-side Session** (what this project uses) — simplest to explain and demo.
2. Cookie Authentication scheme with the JWT stashed in a claim — lets you use
   `[Authorize]` on Razor Pages directly; the "correct" production pattern.
3. `HttpOnly` cookie holding the raw JWT, read manually per request — a middle ground.

This project uses **#1** deliberately, and the code comments in
[`Pages/Login.cshtml.cs`](Pages/Login.cshtml.cs) call out exactly what you'd change to
upgrade to #2 for a real app.

### Step 3 — Wire up Session
File: [`Program.cs`](Program.cs)
```csharp
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
});
...
app.UseSession();   // must run before UseAuthorization() / MapRazorPages()
```
`AddDistributedMemoryCache` backs Session with an in-process dictionary — fine for a
demo/single-instance app; a real deployment would swap in Redis (`AddStackExchangeRedisCache`)
so session survives across multiple app instances/restarts.

### Step 4 — A typed HttpClient for the API
Files: [`Services/IEmployeeApiClient.cs`](Services/IEmployeeApiClient.cs),
[`Services/EmployeeApiClient.cs`](Services/EmployeeApiClient.cs)

Registered in `Program.cs`:
```csharp
builder.Services.AddHttpClient<IEmployeeApiClient, EmployeeApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiBaseUrl"]!);
});
```
**Why `AddHttpClient<TInterface, TImpl>` instead of `new HttpClient()`:** raw `new
HttpClient()` per request/class is a well-known footgun — it exhausts sockets under
load (each instance holds its own connection pool that doesn't get reused). The
`IHttpClientFactory`-backed registration pools and reuses `HttpMessageHandler`
instances correctly, and `AddHttpClient<T>` also registers `T` for DI in one call, with
`BaseAddress` pre-configured so callers just do `client.PostAsJsonAsync("api/auth/login", ...)`.

### Step 5 — Login page
Files: [`Pages/Login.cshtml`](Pages/Login.cshtml), [`Pages/Login.cshtml.cs`](Pages/Login.cshtml.cs)

- `LoginModel` depends on `IEmployeeApiClient` (constructor injection, same DI story
  as the API projects).
- `OnPostAsync()` calls `_apiClient.LoginAsync(...)`, which POSTs to
  `/api/auth/login` on project 1.
- On success: `HttpContext.Session.SetString("JwtToken", result.Token)`, then
  `RedirectToPage("/Dashboard")`.
- On failure: shows the API's error message inline, page redisplays (standard
  Post-Redirect-Get is skipped here on purpose — validation errors re-render the same
  page so the user doesn't lose their typed username).
- Model validation (`[Required]` on `LoginViewModel`) runs via `ModelState.IsValid`
  before ever calling the API — fail fast client/server-side before spending an HTTP
  round trip.

### Step 6 — Dashboard page (the protected page)
Files: [`Pages/Dashboard.cshtml`](Pages/Dashboard.cshtml), [`Pages/Dashboard.cshtml.cs`](Pages/Dashboard.cshtml.cs)

```csharp
var token = HttpContext.Session.GetString("JwtToken");
if (string.IsNullOrEmpty(token))
    return RedirectToPage("/Login");
```
That's the auth guard — every request to `/Dashboard` checks Session first. Then it
calls `GetEmployeesAsync(token)` / `GetDepartmentsAsync(token)`, which attach
`Authorization: Bearer <token>` and hit project 1's `[Authorize]`-protected
`/api/employees` and `/api/departments` endpoints. If the API ever rejects the token
(expired/invalid → `401` → `HttpRequestException` from `EnsureSuccessStatusCode()`),
the catch block clears the session and bounces back to Login.

The page renders three summary cards (employee count, department count, total
payroll) plus an employee table and a department list — pulled live from the API on
every page load, no client-side caching.

### Step 7 — Logout
A `<form method="post" asp-page-handler="Logout">` posts to the `OnPostLogout` handler
in `DashboardModel`, which does `HttpContext.Session.Clear()` and redirects to Login.
Razor Pages' built-in anti-forgery token validation protects this POST automatically —
every `<form method="post">` gets a hidden `__RequestVerificationToken` field for free.

### Step 8 — Root routing
File: [`Pages/Index.cshtml.cs`](Pages/Index.cshtml.cs) — `/` just checks Session and
redirects to `/Login` or `/Dashboard`, so users always land somewhere meaningful.

### Step 9 — Config
File: [`appsettings.json`](appsettings.json)
```json
"ApiBaseUrl": "http://localhost:5199"
```
Points at project 1. Change this if you run `EmployeeDeptApi` on a different port.

---

## Run it (both projects together)

```bash
# Terminal 1 - the API
cd ../EmployeeDeptApi
dotnet run --urls http://localhost:5199

# Terminal 2 - this web app
cd ../EmployeeDeptApi.WebApp
dotnet run --urls http://localhost:5100
```
Open `http://localhost:5100` → redirects to `/Login` → sign in with `admin` / `admin123`
→ redirects to `/Dashboard` showing live employee/department data pulled from the API.

**Verified this exact flow with curl** (cookie jar carrying the session + antiforgery
token across requests): login → 302 to Dashboard → dashboard shows correct counts after
inserting a test employee via the API → logout → 302 to Login → Dashboard now
redirects unauthenticated requests back to Login. No browser needed to prove it works,
but it's obviously meant to be demoed in one.

---

## Common interview follow-ups

**"Why not call the database directly from this Razor Pages app instead of an API?"**
→ Separation of concerns: the API is the single source of truth / business rules
(email uniqueness, department-has-employees checks, etc.), reusable by this web app,
a mobile app, or anything else. The web app's only job is presentation.

**"Isn't storing a JWT in server-side Session unusual?"**
→ Yes — normally a *browser-based SPA* stores the JWT itself (memory/localStorage) and
attaches it client-side. Here, the Razor Pages *server* is the one calling the API
(a classic BFF — Backend-for-Frontend — pattern), so it holds the token server-side in
Session and the browser only ever sees this app's own session cookie, never the JWT
itself. That's actually a security improvement over a SPA holding the raw JWT in
`localStorage` (which is readable by any injected JS / XSS).

**"What's missing for production?"**
- Real Cookie Authentication (`[Authorize]` on pages) instead of manual Session checks.
- Anti-forgery is already on by default for POSTs — nothing to add there.
- `HttpClient` retry/timeout policy (Polly) for when the API is briefly unavailable.
- Move `ApiBaseUrl` per-environment (`appsettings.Production.json` / env var).
- CSRF-safe logout is already handled by Razor Pages' built-in antiforgery tokens.
