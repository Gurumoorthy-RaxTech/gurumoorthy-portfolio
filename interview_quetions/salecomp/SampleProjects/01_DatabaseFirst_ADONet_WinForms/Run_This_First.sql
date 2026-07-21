-- ============================================================================
-- DATABASE-FIRST approach: the database/table is created FIRST (by you, the DBA,
-- running this script), and the application code is written to match it AFTER.
-- Run this in SSMS against the SchoolTest database BEFORE running the WinForms app.
-- ============================================================================

USE SchoolTest;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Students')
BEGIN
    CREATE TABLE Students (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        Name       NVARCHAR(100) NOT NULL,
        ClassName  NVARCHAR(50)  NULL,
        Age        INT           NOT NULL,
        Email      NVARCHAR(150) NULL
    );
END
GO

-- Optional sample rows so the grid isn't empty on first run
IF NOT EXISTS (SELECT * FROM Students)
BEGIN
    INSERT INTO Students (Name, ClassName, Age, Email) VALUES
    ('Arun Kumar', '10-A', 15, 'arun@example.com'),
    ('Priya S',    '10-B', 15, 'priya@example.com'),
    ('Karthik R',  '9-A',  14, 'karthik@example.com');
END
GO
