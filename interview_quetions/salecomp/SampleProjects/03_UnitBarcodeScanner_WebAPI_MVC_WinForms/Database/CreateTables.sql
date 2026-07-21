-- UnitBarcodeScanner - table creation script
-- Run this manually in SSMS against the SchoolTest database at 192.168.1.52
-- (same server/database the other SampleProjects in this repo already use).
-- This script is NOT run by any of the three apps - they only ever SELECT/
-- INSERT/UPDATE rows in tables that already exist.

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Unit')
BEGIN
    CREATE TABLE Unit (
        UnitId INT IDENTITY(1,1) PRIMARY KEY,
        Barcode NVARCHAR(50) NOT NULL UNIQUE,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- NOTE on the UnitId column below:
-- The original task description only listed HistoryId, OperatorName and
-- ScanTime for ScanHistory. A scan history row that doesn't say WHICH unit
-- was scanned isn't actually useful for anything (you couldn't answer
-- "show me every time UNIT-0001 was scanned"), so a UnitId foreign key back
-- to Unit was added as a deliberate, sensible extension of the stated
-- requirement. See README.txt for the full reasoning.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ScanHistory')
BEGIN
    CREATE TABLE ScanHistory (
        HistoryId INT IDENTITY(1,1) PRIMARY KEY,
        UnitId INT NOT NULL,
        OperatorName NVARCHAR(100) NOT NULL,
        ScanTime DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ScanHistory_Unit FOREIGN KEY (UnitId) REFERENCES Unit(UnitId)
    );
END
GO

-- A few sample rows so the UI has something to show on first run
IF NOT EXISTS (SELECT 1 FROM Unit)
BEGIN
    INSERT INTO Unit (Barcode, Status, CreatedDate) VALUES
        ('UNIT-0001', 'Active', GETDATE()),
        ('UNIT-0002', 'Active', GETDATE());
END
GO
