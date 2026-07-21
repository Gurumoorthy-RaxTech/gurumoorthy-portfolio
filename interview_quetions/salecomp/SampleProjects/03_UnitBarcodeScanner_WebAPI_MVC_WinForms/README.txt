UnitBarcodeScanner - Web API + MVC + WinForms (.NET 8)
====================================================================

WHAT THIS DEMONSTRATES
  A small barcode-scan pipeline: a physical (or simulated) barcode scanner
  feeds a barcode into a UI -> the UI calls a Web API -> the API writes to
  a shared SQL Server database -> a second, completely independent UI reads
  the same data back out. This is the same basic shape as a real warehouse
  / asset-tracking system: one API, multiple client apps.

  Unlike the two sibling ADO.NET sample projects (01, 02), which are single
  WinForms apps talking straight to the database on .NET Framework 4.7.2,
  this one is modern .NET 8 and splits into THREE separate projects that
  only talk to each other over HTTP:

    UnitBarcodeScanner.Api               - ASP.NET Core 8 Web API (Dapper)
    UnitBarcodeScanner.Web               - ASP.NET Core 8 MVC web dashboard
    UnitBarcodeScanner.WinFormsScanner   - .NET 8 WinForms desktop scanner

WHY THREE PROJECTS INSTEAD OF ONE
  The task asked for a Web API, an MVC UI, AND a WinForms UI - three
  deliverables, not one. Rather than have the MVC and WinForms apps both
  hit the database directly (which would mean duplicating all the data
  access/SQL twice, and no single place enforcing "how a scan gets saved"),
  both UIs go through the one Web API:

    - UnitBarcodeScanner.WinFormsScanner is a desktop app, so it calls the
      API directly with HttpClient. No browser is involved, so CORS simply
      does not apply to it.
    - UnitBarcodeScanner.Web is a server-rendered MVC app. Its
      HomeController (server-side C#, via IHttpClientFactory) calls the
      API - the BROWSER never calls the API directly. Because the only
      thing hitting the API over HTTP from a browser-adjacent context is
      itself a plain ASP.NET Core server, there is no cross-origin request
      happening anywhere, so there's no CORS to configure either.

  Net effect: one Web API is the single source of truth for "how do you
  save a scan / read history", and both UIs are thin, replaceable clients
  on top of it - which is also why UnitBarcodeScanner.Web keeps its own
  local copy of the DTO shape (Models/UnitScanViewModel.cs) instead of a
  project reference to the Api project. They're independently deployable,
  like real separate services would be.

  The API runs on a FIXED, HTTP-only port (http://localhost:5199, see
  UnitBarcodeScanner.Api/Properties/launchSettings.json) specifically so
  both clients have a stable, cert-trust-free address to call.

DATABASE DESIGN DECISION: WHY ScanHistory HAS A UnitId COLUMN
  The original task only specified ScanHistory needs HistoryId,
  OperatorName and ScanTime. That's what's implemented - PLUS a UnitId
  foreign key back to Unit, which was NOT explicitly asked for.

  Reasoning: a ScanHistory row that doesn't record which Unit was scanned
  isn't actually usable for anything - you couldn't answer "show me every
  time UNIT-0001 was scanned" or join a history row back to a barcode at
  all. Given the two tables clearly form one feature (you scan a unit's
  barcode, and that scan gets logged), a FK from ScanHistory to Unit is
  the sensible, obviously-intended completion of the requirement rather
  than scope creep. It's called out explicitly here (and in
  Database/CreateTables.sql) as a deliberate interpretation, precisely so
  it's easy to explain if asked "why did you add that column?" in an
  interview: because a history table with no link to what was scanned
  isn't a functional history table.

DATABASE
  Same SQL Server the other SampleProjects already use:
    Server=192.168.1.52, Database=SchoolTest,
    User ID=SchoolCloud, Password=<YOUR_PASSWORD_HERE>, TrustServerCertificate=True

  Nothing in this repo connects to that server automatically. You run
  Database/CreateTables.sql yourself, in SSMS, before running any of the
  three apps. It creates Unit and ScanHistory (see script for exact DDL)
  and inserts two sample Unit rows (UNIT-0001, UNIT-0002) so the UI has
  something to show immediately.

HOW TO RUN
  1. Open SSMS, connect to 192.168.1.52, and run Database\CreateTables.sql
     against the SchoolTest database. This creates Unit + ScanHistory
     (+ 2 sample Unit rows).

  2. Open UnitBarcodeScanner.sln in Visual Studio.

  3. Start the API FIRST and leave it running:
       - Right-click UnitBarcodeScanner.Api -> Debug -> Start New Instance
         (or just set it as the single startup project and press F5 once
         to confirm it comes up at http://localhost:5199/swagger).
       - Leave that console/browser window running - both other apps
         depend on it being up.

  4. Then start a second app AS A SECOND INSTANCE, while the API is still
     running:
       - Right-click UnitBarcodeScanner.Web -> Debug -> Start New Instance
         to open the MVC dashboard in a browser, and/or
       - Right-click UnitBarcodeScanner.WinFormsScanner -> Debug -> Start
         New Instance to open the desktop scanner window.
     (You can also configure multiple startup projects in the solution's
     Properties if you'd rather they all launch together with one F5.)

  5. In the WinForms app: type an operator name, then click into the
     Barcode box and type a barcode (e.g. UNIT-0001, or a brand new one
     like UNIT-0099) and press Enter. A real barcode scanner is just fast
     keyboard typing followed by Enter, so typing it by hand genuinely
     exercises the same code path a real scanner would trigger. The grid
     refreshes automatically and the status label shows "Saved!".

  6. In the MVC web app: refresh the page (or submit the form there
     instead) to see the same scan history - both UIs are reading the
     same ScanHistory/Unit rows out of the same database via the same API.

PROJECT LAYOUT
  UnitBarcodeScanner.sln
  Database/
    CreateTables.sql                 - run this in SSMS first (see above)
  UnitBarcodeScanner.Api/
    appsettings.json                 - ConnectionStrings:SchoolDb lives here
    Properties/launchSettings.json   - fixed HTTP-only port 5199
    Program.cs                       - DI wiring, Swagger, no HTTPS redirect
    Models/Unit.cs, ScanHistory.cs   - POCOs matching the two tables
    Models/Dtos/                     - SaveUnitRequest, ScanHistoryDto
    Data/DapperContext.cs            - hands out SqlConnection via Dapper
    Repositories/UnitRepository.cs   - all SQL (Dapper, transactional save)
    Controllers/UnitController.cs         - POST api/unit/save
    Controllers/ScanHistoryController.cs  - GET  api/scanhistory
  UnitBarcodeScanner.Web/
    appsettings.json                 - ApiBaseUrl (points at the API)
    Program.cs                       - registers the named "UnitApi" HttpClient
    Models/UnitScanViewModel.cs      - form fields + local History DTO
    Controllers/HomeController.cs    - Index (GET) / ScanUnit (POST, PRG)
    Views/Home/Index.cshtml          - scan form + history table
  UnitBarcodeScanner.WinFormsScanner/
    Models/ScanRecord.cs             - local DTO for the grid
    Services/ApiClient.cs            - HttpClient wrapper (base URL const)
    Form1.cs / Form1.Designer.cs     - UI built entirely in code (this was
                                        scaffolded via the dotnet CLI, not
                                        Visual Studio, so there's no .resx -
                                        hand-coding the controls is a fully
                                        valid, common approach)
    Program.cs                       - entry point (Main)

See the chat response for a full line-by-line explanation of the
architecture, the Dapper transaction in UnitRepository.SaveUnitAsync, and
the barcode-scan-as-fast-typing simulation in the WinForms KeyDown handler.
