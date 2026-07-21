SchoolApp_CodeFirst - ADO.NET + WinForms (.NET Framework 4.7.2)
====================================================================

APPROACH: Code-First
  - The Students table does NOT need to exist beforehand.
  - DataAccess/DatabaseInitializer.cs runs an "IF NOT EXISTS ... CREATE TABLE"
    statement via plain ADO.NET the moment the app starts (see Program.cs).
  - This is the ADO.NET-level equivalent of what EF Core's migrations
    automate for you - here it's just one hand-written guarded CREATE TABLE.

HOW TO RUN
  1. Open SchoolApp_CodeFirst.sln in Visual Studio.
  2. Press F5. On first run, DatabaseInitializer.EnsureCreated() creates the
     Students table in SchoolTest automatically (grid starts empty - use Add).
  3. Use the top fields + buttons to Add / Update / Delete / Search.

PROJECT LAYOUT
  SchoolApp_CodeFirst.sln
  SchoolApp_CodeFirst/
    App.config                        - connection string lives here
    Program.cs                         - entry point; calls DatabaseInitializer first
    Form1.cs / Form1.Designer.cs       - the WinForms UI + event handlers
    Models/Student.cs                  - POCO, the "source of truth" for the schema
    DataAccess/DatabaseInitializer.cs  - creates the Students table if missing
    DataAccess/StudentRepository.cs    - all raw ADO.NET SQL (SqlConnection/SqlCommand)

See the chat response for a full line-by-line explanation of the connection
string and the key ADO.NET/WinForms code, plus how this compares to the
Database-First project (01_DatabaseFirst_ADONet_WinForms).
