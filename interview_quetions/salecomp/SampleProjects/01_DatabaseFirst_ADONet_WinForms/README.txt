SchoolApp_DatabaseFirst - ADO.NET + WinForms (.NET Framework 4.7.2)
====================================================================

APPROACH: Database-First
  - The database and Students table are created FIRST (Run_This_First.sql),
    outside the app, by running the script in SSMS.
  - The C# Student.cs class and StudentRepository.cs SQL are then written to
    MATCH that existing schema. The app never creates or alters tables itself.

HOW TO RUN
  1. Open SSMS, connect to 192.168.1.52, and run Run_This_First.sql against
     the SchoolTest database. This creates the Students table (+ 3 sample rows).
  2. Open SchoolApp_DatabaseFirst.sln in Visual Studio.
  3. Press F5. The grid loads existing students; use the top fields + buttons
     to Add / Update / Delete / Search.

PROJECT LAYOUT
  SchoolApp_DatabaseFirst.sln
  SchoolApp_DatabaseFirst/
    App.config              - connection string lives here
    Program.cs               - entry point (Main)
    Form1.cs / Form1.Designer.cs   - the WinForms UI + event handlers
    Models/Student.cs         - POCO matching the Students table
    DataAccess/StudentRepository.cs - all raw ADO.NET SQL (SqlConnection/SqlCommand)

See the chat response for a full line-by-line explanation of the connection
string and the key ADO.NET/WinForms code.
