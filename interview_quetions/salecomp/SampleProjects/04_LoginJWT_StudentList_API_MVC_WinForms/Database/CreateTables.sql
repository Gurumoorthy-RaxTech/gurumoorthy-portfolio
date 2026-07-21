-- LoginDemo - table creation script
-- Run this manually in SSMS against the SchoolTest database at 192.168.1.52
-- (same server/database the other SampleProjects in this repo already use).
-- This script is NOT run by any of the three apps - they only ever SELECT/
-- INSERT rows in tables that already exist.

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AppUser')
BEGIN
    CREATE TABLE AppUser (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(200) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Student')
BEGIN
    CREATE TABLE Student (
        StudentId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Class NVARCHAR(20) NOT NULL,
        RollNumber NVARCHAR(20) NOT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- Seed a demo login user. Password is 'Admin@123'. PasswordHash below is the
-- ACTUAL computed SHA256 hash of that password (lowercase hex, 64 chars),
-- produced the same way LoginDemo.Api/Controllers/AuthController.cs hashes
-- an incoming password before comparing it: SHA256 over the UTF-8 bytes of
-- the plaintext, then lowercase hex-encoded.
--
-- To regenerate this value yourself (e.g. if you change the demo password),
-- run this in a scratch Program.cs with `dotnet run`:
--
--   using System.Security.Cryptography;
--   using System.Text;
--   var bytes = SHA256.HashData(Encoding.UTF8.GetBytes("Admin@123"));
--   Console.WriteLine(Convert.ToHexString(bytes).ToLowerInvariant());
--
-- (Convert.ToHexString produces uppercase hex, hence the .ToLowerInvariant()
-- to match the lowercase hash stored here.)
IF NOT EXISTS (SELECT 1 FROM AppUser)
BEGIN
    INSERT INTO AppUser (Username, PasswordHash, FullName) VALUES
        ('admin', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', 'Site Administrator');
END
GO

IF NOT EXISTS (SELECT 1 FROM Student)
BEGIN
    INSERT INTO Student (Name, Class, RollNumber) VALUES
        ('Aarav Kumar', '10-A', 'R101'), ('Diya Sharma', '10-A', 'R102'),
        ('Kabir Singh', '10-B', 'R103'), ('Meera Iyer', '10-B', 'R104'),
        ('Rohan Nair', '9-A', 'R105'), ('Sanya Reddy', '9-A', 'R106');
END
GO
