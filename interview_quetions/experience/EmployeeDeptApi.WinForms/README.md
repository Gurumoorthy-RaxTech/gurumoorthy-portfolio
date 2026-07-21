# EmployeeDeptApi.WinForms — Desktop Login + Dashboard (Interview Ready)

A fourth project: a **Windows Forms** desktop app with the same Login → Dashboard shape
as the Razor Pages project (`EmployeeDeptApi.WebApp`), consuming the exact same
`EmployeeDeptApi` (project 1) over HTTP/JWT — "same data," different UI technology.

Adds one thing the web version didn't need to: a Dashboard with **Add Employee** and
**Delete Employee** actions (via a `DataGridView` + a modal `AddEmployeeForm`), so this
project also demonstrates round-tripping writes, not just reads.

---

## Step-by-step: how this was built

### Step 1 — Scaffold
```bash
dotnet new winforms -n EmployeeDeptApi.WinForms -f net9.0
```
Note the resulting `<TargetFramework>` is `net9.0-windows` — WinForms is a
Windows-only UI framework, so the template appends the `-windows` OS-specific suffix
automatically. This project **only runs on Windows** (unlike the other three, which
are all cross-platform ASP.NET Core).

### Step 2 — Add packages for DI + HttpClient
```bash
dotnet add package Microsoft.Extensions.Hosting
dotnet add package Microsoft.Extensions.Http
```
**Key point to make in the interview:** dependency injection is not an "ASP.NET Core
feature" — it's a generic .NET Extensions library (`Microsoft.Extensions.DependencyInjection`)
that any .NET app, including a WinForms desktop app, can pull in via the **Generic
Host** (`Microsoft.Extensions.Hosting`). Same container, same lifetime concepts
(Singleton/Scoped/Transient), same `AddHttpClient<T>` pattern used in the other three
projects.

### Step 3 — Reuse the same DTOs and API-client contract
Files: [`Models/ApiModels.cs`](Models/ApiModels.cs), [`Services/IEmployeeApiClient.cs`](Services/IEmployeeApiClient.cs),
[`Services/EmployeeApiClient.cs`](Services/EmployeeApiClient.cs)

These are near-identical to the Razor Pages project's versions — same JSON shapes,
because both clients are talking to the same `EmployeeDeptApi`. `EmployeeApiClient`
adds `CreateEmployeeAsync` / `DeleteEmployeeAsync` on top of what the web app needed,
to support the Dashboard's Add/Delete buttons.

### Step 4 — Replace HTTP "Session" with an in-memory SessionState singleton
File: [`Services/SessionState.cs`](Services/SessionState.cs)

A desktop app has no browser session/cookie mechanism. Registered as a DI
**Singleton** (`builder.Services.AddSingleton<SessionState>()`), one instance lives for
the whole process and holds the JWT + username — the same role `HttpContext.Session`
played in the web app, just an ordinary C# object here.

### Step 5 — LoginForm
File: [`Forms/LoginForm.cs`](Forms/LoginForm.cs)

- UI built by hand in `InitializeComponent()` (no `.Designer.cs` split file — everything
  in one readable file, appropriate for a form this size).
- Constructor takes `IEmployeeApiClient` and `SessionState` — **constructor injection**,
  resolved by the DI container when `services.GetRequiredService<LoginForm>()` is
  called in `Program.cs`.
- `BtnLogin_Click` is `async void` (the one place `async void` is correct/necessary in
  .NET — WinForms event handlers can't be `async Task`, since the event signature is
  fixed) — awaits `LoginAsync`, and on success sets `DialogResult = DialogResult.OK`
  then `Close()`, which is what makes `ShowDialog()` in `Program.cs` return `OK`.

### Step 6 — DashboardForm
File: [`Forms/DashboardForm.cs`](Forms/DashboardForm.cs)

- Three summary "cards" (bordered `Panel` + `Label`), a `DataGridView` bound to a
  projection of the employee list (anonymous-object `.Select(...)`, so the grid shows
  friendly columns without exposing the raw API model), and a `ListBox` of departments.
- `LoadDataAsync()` calls `GetEmployeesAsync`/`GetDepartmentsAsync` with the token from
  `SessionState`. A caught `HttpRequestException` (e.g. token rejected → 401) clears the
  session, sets `LoggedOut = true`, and closes the form — same "your session
  expired, please log in again" idea as the web app's catch block.
- **Add Employee** opens `AddEmployeeForm` via `ShowDialog(this)`; the grid only
  reloads if the dialog returns `DialogResult.OK`.
- **Delete Selected** reads the selected `DataGridView` row's bound `EmployeeId`,
  confirms via `MessageBox.Show(..., MessageBoxButtons.YesNo)`, then calls
  `DeleteEmployeeAsync` and reloads.
- **Logout** clears `SessionState`, sets `LoggedOut = true`, closes the form.

### Step 7 — AddEmployeeForm (modal dialog)
File: [`Forms/AddEmployeeForm.cs`](Forms/AddEmployeeForm.cs)

A `ComboBox` bound to the department list (`DisplayMember`/`ValueMember`) so the user
picks a department by name but the form submits its `DepartmentId`. Validates required
fields client-side before calling the API; shows the API's own validation error
(e.g. duplicate email) inline if the API rejects it.

### Step 8 — Program.cs: Generic Host + the Login/Dashboard loop
File: [`Program.cs`](Program.cs)

```csharp
var builder = Host.CreateApplicationBuilder();
builder.Services.AddHttpClient<IEmployeeApiClient, EmployeeApiClient>(client =>
    client.BaseAddress = new Uri(apiBaseUrl));
builder.Services.AddSingleton<SessionState>();
builder.Services.AddTransient<LoginForm>();
builder.Services.AddTransient<DashboardForm>();

using var host = builder.Build();
var services = host.Services;

while (true)
{
    using var loginForm = services.GetRequiredService<LoginForm>();
    if (loginForm.ShowDialog() != DialogResult.OK) break;   // cancelled -> exit app

    using var dashboardForm = services.GetRequiredService<DashboardForm>();
    Application.Run(dashboardForm);                          // this IS the message loop

    if (!dashboardForm.LoggedOut) break;                      // closed via X -> exit app
    // else: LoggedOut was set true -> loop back to a fresh LoginForm
}
```
Two things worth explaining if asked:
- **Why `Transient` for the forms:** each pass through the loop needs a *new* form
  instance (the old one was `Dispose()`d by the `using`). Singleton would hand back a
  disposed object on the second login.
- **`Application.Run(dashboardForm)` vs `ShowDialog()`:** `ShowDialog()` is a *modal*
  call — it blocks the calling code but the modal has an owner. `Application.Run(form)`
  makes `form` the actual Win32 message pump owner; the call doesn't return until that
  form closes. Using `Application.Run` for the Dashboard (not `ShowDialog`) means it's
  a normal top-level window, while `LoginForm` uses `ShowDialog()` because at that point
  there's no host window yet — the Login prompt has to pump its own modal loop.

`Host.CreateApplicationBuilder()` also auto-loads [`appsettings.json`](appsettings.json)
(`ApiBaseUrl`) from the output directory — configured to copy on build via the
`<None Update="appsettings.json"><CopyToOutputDirectory>` entry in the `.csproj`.

### Step 9 — Run it
```bash
# Terminal 1 - the API
cd ../EmployeeDeptApi && dotnet run --urls http://localhost:5199

# Terminal 2 - this desktop app
cd ../EmployeeDeptApi.WinForms && dotnet run
```
Login with `admin` / `admin123` → Dashboard loads live data → Add/Delete an employee →
Logout returns to Login → closing either window with the titlebar X exits the app.

---

## How this was verified without eyes on a screen

The build was confirmed clean (`dotnet build`, 0 warnings/errors), and the running
`.exe` was launched and confirmed alive with the correct window title
("Employee Dept Portal - Login"). Automated keystroke injection into the window wasn't
reachable from this environment (no attached interactive desktop session to send input
into — an environment limitation, not an app bug).

To still prove the logic is correct, `EmployeeApiClient` — the exact class every form
calls — was exercised directly against the live API from a throwaway console harness
(same project reference, same method calls a form would make): login succeeded and
returned a JWT, `GetDepartmentsAsync` returned the 3 seeded departments,
`CreateEmployeeAsync` inserted a row that then appeared in `GetEmployeesAsync`,
`DeleteEmployeeAsync` removed it, and a bad-password login correctly returned
`Success=false` with the API's error message. That's every HTTP call the UI makes,
verified end-to-end — the forms are thin wrappers (button click → call this same
method → bind the result to a control) around code already proven correct.

---

## Common interview follow-ups

**"Why WinForms and not WPF?"** → Answer honestly based on what you know: WinForms is
simpler/faster to hand-code without XAML tooling (as done here); WPF gives you
data-binding, MVVM, styling/templating, and better testability at the cost of more
setup. For a quick CRUD utility, WinForms is a reasonable, fast choice.

**"How would you avoid blocking the UI thread?"** → Every API call here is `await`ed
from an `async void` event handler — the `await` yields control back to the message
loop while the HTTP request is in flight, so the UI stays responsive without any manual
`Thread`/`BackgroundWorker` plumbing (which was the pre-`async`/`await` way to do this).

**"What's missing for production?"** → Store the JWT more securely than an in-memory
singleton if the app needs to persist login across restarts (DPAPI-protected local
file); handle token expiry with a refresh flow instead of forcing a full re-login;
replace hand-coded `Point`/`Size` layout with `TableLayoutPanel`/`FlowLayoutPanel` or
proper anchoring for real resizing behavior; add a global `ThreadException` handler
(`Application.ThreadException`) so an unhandled exception shows a friendly dialog
instead of crashing.
