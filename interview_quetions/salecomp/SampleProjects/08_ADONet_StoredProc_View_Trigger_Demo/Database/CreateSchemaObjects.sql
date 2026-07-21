-- ============================================================================
-- CreateSchemaObjects.sql
-- Run this in SSMS against the SchoolTest database BEFORE running the
-- AdoNetDemo console app. This script creates everything the C# code talks
-- to: a table, an audit table, an AFTER INSERT trigger, a view, and a
-- stored procedure. Nothing here is created by the app itself - the app
-- only ever SELECTs/INSERTs against objects that already exist, same
-- "you run the SQL manually first" convention as sibling project 01's
-- Run_This_First.sql.
-- ============================================================================

USE SchoolTest;
GO

-- 1) Base table the whole demo revolves around.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Product')
BEGIN
    CREATE TABLE Product (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Price DECIMAL(10,2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0
    );
END
GO

-- 2) Audit table the trigger below writes to. The app never inserts into
--    this table directly - every row in here is proof the trigger fired.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ProductAudit')
BEGIN
    CREATE TABLE ProductAudit (
        AuditId INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL,
        Action NVARCHAR(20) NOT NULL,
        ActionDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 3) TRIGGER: fires automatically AFTER every INSERT into Product and writes
--    an audit row. This is a realistic "auto-audit-logging" pattern - the
--    application code never has to remember to log anything, the database
--    guarantees it happens as part of the same INSERT.
IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_Product_Insert')
    DROP TRIGGER trg_Product_Insert;
GO
CREATE TRIGGER trg_Product_Insert ON Product
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ProductAudit (ProductId, Action)
    SELECT ProductId, 'INSERT' FROM inserted;
END;
GO

-- 4) VIEW: a reusable, named, filtered query. Instead of every caller
--    re-typing "WHERE Stock < 10" everywhere, they just SELECT from this view.
IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'vw_LowStockProducts')
    DROP VIEW vw_LowStockProducts;
GO
CREATE VIEW vw_LowStockProducts AS
    SELECT ProductId, Name, Price, Stock FROM Product WHERE Stock < 10;
GO

-- 5) STORED PROCEDURE: a parameterized, precompiled lookup by primary key.
--    Called from C# with CommandType.StoredProcedure instead of inline SQL text.
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_GetProductById')
    DROP PROCEDURE sp_GetProductById;
GO
CREATE PROCEDURE sp_GetProductById
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ProductId, Name, Price, Stock FROM Product WHERE ProductId = @ProductId;
END;
GO

-- seed a couple of rows so the low-stock view has something to show immediately
IF NOT EXISTS (SELECT 1 FROM Product)
BEGIN
    INSERT INTO Product (Name, Price, Stock) VALUES
        ('Notebook', 45.00, 120), ('Whiteboard Marker', 12.50, 6), ('Stapler', 89.00, 3);
END
GO
