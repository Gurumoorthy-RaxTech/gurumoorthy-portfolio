LoginDemo - JWT Login + Student List - Web API + MVC + WinForms (.NET 8)
====================================================================

WHAT THIS DEMONSTRATES
  The single most common shape of a live-coding "build me X" interview
  task: a login screen that issues a token, and a protected list screen
  behind it, wired up end to end - API, database, and TWO independent
  client UIs (a browser-based MVC dashboard and a WinForms desktop app)
  both consuming the exact same login + list endpoints.

  Three separate projects that only talk to each other over HTTP:

    LoginDemo.Api        - ASP.NET Core 8 Web API (Dapper, JWT issuing/validating)
    LoginDemo.Web         - ASP.NET Core 8 MVC web app (session-stored JWT)
    LoginDemo.WinForms    - .NET 8 WinForms desktop app (JWT in a static field)

WHY THREE PROJECTS INSTEAD OF ONE
  Same reasoning as the sibling UnitBarcodeScanner sample (03): the task
  wants a Web API, an MVC UI, AND a WinForms UI - three deliverables, not
  one - and both UIs should be thin clients on top of a single API rather
  than each reimplementing "how do you check a password" or "how do you
  read the student list" against the database directly.

    - LoginDemo.WinForms is a desktop app, so it calls the API directly
      with HttpClient (Services/ApiClient.cs). No browser is involved, so
      CORS simply does not apply to it.
    - LoginDemo.Web is a server-rendered MVC app. Its AccountController and
      StudentController (server-side C#, via IHttpClientFactory) call the
      API - the BROWSER never calls the API directly. Because the only
      thing hitting the API over HTTP from a browser-adjacent context is
      itself a plain ASP.NET Core server, there is no cross-origin request
      happening anywhere, so there's no CORS to configure either.

  Net effect: LoginDemo.Api is the single source of truth for "who is
  allowed to log in" and "what does the student list look like", and both
  UIs are independently deployable, replaceable clients on top of it -
  which is also why LoginDemo.Web and LoginDemo.WinForms each keep their
  own local copy of the DTO shapes (LoginApiResult/StudentItem,
  Models/StudentDto.cs) instead of a project reference to LoginDemo.Api.

  The API runs on a FIXED, HTTP-only port (http://localhost:5299, see
  LoginDemo.Api/Properties/launchSettings.json) specifically so both
  clients have a stable, cert-trust-free address to call.

HOW THE LOGIN/JWT FLOW WORKS
  1. POST api/auth/login (LoginDemo.Api/Controllers/AuthController.cs)
     takes { Username, Password }, looks up AppUser by Username via
     Dapper, hashes the incoming password (see PASSWORD HASHING below),
     compares it to the stored PasswordHash, and on a match mints a JWT
     (System.IdentityModel.Tokens.Jwt) signed with the symmetric key in
     appsettings.json's Jwt:Key section. Claims: sub = Username,
     name = FullName. Returns { token, fullName }. Bad credentials -> 401
     with a message, not a stack trace.

  2. GET api/students (LoginDemo.Api/Controllers/StudentsController.cs) is
     decorated [Authorize]. Program.cs registers JWT Bearer authentication
     with AddAuthentication().AddJwtBearer(...), validating issuer,
     audience, signing key and lifetime against the same Jwt: section -
     so a token minted by AuthController.Login always validates here, and
     a missing/invalid/expired token gets a 401 automatically, no code
     needed in the controller itself.

  3. Both UIs get a token from step 1 and send it back as
     Authorization: Bearer <token> on step 2:
       - LoginDemo.Web stores the token in ASP.NET Core Session
         (AccountController.Login) and StudentController.Index reads it
         back out before calling the API. This needed
         AddDistributedMemoryCache() + AddSession() in Program.cs and
         app.UseSession() in the pipeline (after UseRouting, before
         UseAuthorization/MapControllerRoute) so controller actions can
         read/write HttpContext.Session.
       - LoginDemo.WinForms stores the token in a static field on
         LoginForm (LoginForm.CurrentToken) and StudentListForm reads it
         back out, setting HttpClient.DefaultRequestHeaders.Authorization
         before calling GET api/students.

PASSWORD HASHING - READ THIS BEFORE AN INTERVIEW ASKS ABOUT IT
  LoginDemo.Api/Services/PasswordHasher.cs hashes passwords with plain
  SHA256 over the UTF-8 password bytes, lowercase hex-encoded, with NO
  per-user salt. This is DEMO-GRADE ONLY - it exists so the login flow can
  be built and verified fast in a live-coding round, not because it's
  secure. A real production system should use BCrypt or Argon2 (or
  ASP.NET Core Identity's PasswordHasher<T>, which does the same thing
  properly) with a random per-user salt, so two users with the same
  password don't get the same hash and a leaked hash table can't be
  attacked with a plain rainbow table.

  If an interviewer asks "is this how you'd do it for real?", say exactly
  that out loud - naming the tradeoff yourself, unprompted, is itself a
  good signal. Don't wait to be caught; volunteer it.

DATABASE
  Same SQL Server the other SampleProjects already use:
    Server=192.168.1.52, Database=SchoolTest,
    User ID=SchoolCloud, Password=<YOUR_PASSWORD_HERE>, TrustServerCertificate=True

  Nothing in this repo connects to that server automatically. You run
  Database/CreateTables.sql yourself, in SSMS, before running any of the
  three apps. It creates AppUser and Student (see script for exact DDL),
  seeds one demo login user (admin / Admin@123) and six sample Student
  rows so the UI has something to show immediately.

  The seeded PasswordHash value in CreateTables.sql is a REAL, already-
  computed SHA256 hash of the string "Admin@123" (lowercase hex, 64
  characters) - not a placeholder. If you ever want to change the demo
  password, recompute the hash yourself and update the INSERT: run this
  in a scratch Program.cs with `dotnet run`:

    using System.Security.Cryptography;
    using System.Text;
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes("YourNewPassword"));
    Console.WriteLine(Convert.ToHexString(bytes).ToLowerInvariant());

  (Convert.ToHexString produces UPPERCASE hex, hence the
  .ToLowerInvariant() - the hash stored in the seed script and the hash
  PasswordHasher.Hash() computes at login time must both be lowercase for
  the string comparison in AuthController.Login to match.)

HOW TO RUN
  1. Open SSMS, connect to 192.168.1.52, and run Database\CreateTables.sql
     against the SchoolTest database. This creates AppUser + Student
     (+ 1 demo user, + 6 sample Student rows).

  2. Open LoginDemo.sln in Visual Studio.

  3. Start the API FIRST and leave it running:
       - Right-click LoginDemo.Api -> Debug -> Start New Instance
         (or just set it as the single startup project and press F5 once
         to confirm it comes up at http://localhost:5299/swagger).
       - Leave that console/browser window running - both other apps
         depend on it being up.

  4. Then start a second app AS A SECOND INSTANCE, while the API is still
     running:
       - Right-click LoginDemo.Web -> Debug -> Start New Instance to open
         the MVC login page in a browser, and/or
       - Right-click LoginDemo.WinForms -> Debug -> Start New Instance to
         open the desktop login window.
     (You can also configure multiple startup projects in the solution's
     Properties if you'd rather they all launch together with one F5.)

  5. Log in with username admin and password Admin@123 in either UI. On
     success you land on the student list, fetched from the API with your
     JWT as a Bearer token. Click Logout in either UI to clear the
     stored token and go back to the login screen.

PROJECT LAYOUT
  LoginDemo.sln
  Database/
    CreateTables.sql                 - run this in SSMS first (see above)
  LoginDemo.Api/
    appsettings.json                 - ConnectionStrings:SchoolDb + Jwt: section
    Properties/launchSettings.json   - fixed HTTP-only port 5299
    Program.cs                       - DI wiring, JWT Bearer auth, Swagger, no HTTPS redirect
    Models/AppUser.cs, Student.cs    - POCOs matching the two tables
    Models/Dtos/                     - LoginRequest, LoginResponse
    Services/PasswordHasher.cs       - DEMO-grade SHA256 hashing (see above)
    Services/JwtTokenService.cs      - mints JWTs from the Jwt: config section
    Data/DapperContext.cs            - hands out SqlConnection via Dapper
    Repositories/UserRepository.cs, StudentRepository.cs  - all SQL (Dapper)
    Controllers/AuthController.cs         - POST api/auth/login
    Controllers/StudentsController.cs     - GET  api/students ([Authorize])
  LoginDemo.Web/
    appsettings.json                 - ApiBaseUrl (points at the API)
    Program.cs                       - registers the named "LoginApi" HttpClient + Session
    Models/LoginViewModel.cs         - login form fields + error message
    Models/LoginApiResult.cs, StudentItem.cs  - local mirrors of the API DTOs
    Controllers/AccountController.cs - Login (GET/POST), Logout
    Controllers/StudentController.cs - Index (reads JWT from session)
    Controllers/HomeController.cs    - Index just redirects to Student or Login
    Views/Account/Login.cshtml       - centered login form
    Views/Student/Index.cshtml       - student table + Logout link
  LoginDemo.WinForms/
    Models/StudentDto.cs             - local DTO for the grid
    Services/ApiClient.cs            - HttpClient wrapper (base URL const, LoginAsync/GetStudentsAsync)
    LoginForm.cs / LoginForm.Designer.cs             - startup form (this was
    StudentListForm.cs / StudentListForm.Designer.cs   scaffolded via the
                                        dotnet CLI, not Visual Studio, so
                                        there's no .resx - hand-coding the
                                        controls is a fully valid, common
                                        approach)
    Program.cs                       - entry point (Main), starts on LoginForm

See the chat response for a full line-by-line explanation of the JWT
issuing/validation wiring in Program.cs and AuthController, and the
session-vs-static-field token storage choice in LoginDemo.Web vs
LoginDemo.WinForms.
