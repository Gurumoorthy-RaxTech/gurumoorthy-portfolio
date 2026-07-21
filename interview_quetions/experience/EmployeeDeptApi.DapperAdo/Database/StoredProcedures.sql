-- ============================================================
-- Stored Procedures for Department & Employee CRUD
-- Database: SchoolTest
-- Reuses the [Departments] / [Employees] tables created by the
-- EF Core migration in the sibling EmployeeDeptApi project.
-- Safe to re-run: every CREATE is guarded with DROP IF EXISTS.
-- ============================================================

-- ================= DEPARTMENT =================

IF OBJECT_ID('dbo.sp_Department_GetAll', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_GetAll;
GO
CREATE PROCEDURE dbo.sp_Department_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DepartmentId, Name, Location FROM dbo.Departments ORDER BY DepartmentId;
END
GO

IF OBJECT_ID('dbo.sp_Department_GetById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_GetById;
GO
CREATE PROCEDURE dbo.sp_Department_GetById
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DepartmentId, Name, Location FROM dbo.Departments WHERE DepartmentId = @DepartmentId;
END
GO

IF OBJECT_ID('dbo.sp_Department_Insert', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_Insert;
GO
CREATE PROCEDURE dbo.sp_Department_Insert
    @Name NVARCHAR(100),
    @Location NVARCHAR(200) = NULL,
    @NewDepartmentId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Departments (Name, Location) VALUES (@Name, @Location);
    SET @NewDepartmentId = SCOPE_IDENTITY();
END
GO

IF OBJECT_ID('dbo.sp_Department_Update', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_Update;
GO
CREATE PROCEDURE dbo.sp_Department_Update
    @DepartmentId INT,
    @Name NVARCHAR(100),
    @Location NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Departments
    SET Name = @Name, Location = @Location
    WHERE DepartmentId = @DepartmentId;
END
GO

IF OBJECT_ID('dbo.sp_Department_Delete', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_Delete;
GO
CREATE PROCEDURE dbo.sp_Department_Delete
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Departments WHERE DepartmentId = @DepartmentId;
END
GO

IF OBJECT_ID('dbo.sp_Department_NameExists', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_NameExists;
GO
CREATE PROCEDURE dbo.sp_Department_NameExists
    @Name NVARCHAR(100),
    @ExcludeId INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CASE WHEN EXISTS (
        SELECT 1 FROM dbo.Departments WHERE Name = @Name AND DepartmentId <> @ExcludeId
    ) THEN 1 ELSE 0 END AS Result;
END
GO

IF OBJECT_ID('dbo.sp_Department_HasEmployees', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Department_HasEmployees;
GO
CREATE PROCEDURE dbo.sp_Department_HasEmployees
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CASE WHEN EXISTS (
        SELECT 1 FROM dbo.Employees WHERE DepartmentId = @DepartmentId
    ) THEN 1 ELSE 0 END AS Result;
END
GO

-- ================= EMPLOYEE =================

IF OBJECT_ID('dbo.sp_Employee_GetAll', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_GetAll;
GO
CREATE PROCEDURE dbo.sp_Employee_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.EmployeeId, e.FirstName, e.LastName, e.Email, e.Phone,
        e.Salary, e.DateOfJoining, e.DepartmentId,
        d.Name AS DepartmentName
    FROM dbo.Employees e
    INNER JOIN dbo.Departments d ON d.DepartmentId = e.DepartmentId
    ORDER BY e.EmployeeId;
END
GO

IF OBJECT_ID('dbo.sp_Employee_GetById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_GetById;
GO
CREATE PROCEDURE dbo.sp_Employee_GetById
    @EmployeeId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.EmployeeId, e.FirstName, e.LastName, e.Email, e.Phone,
        e.Salary, e.DateOfJoining, e.DepartmentId,
        d.Name AS DepartmentName
    FROM dbo.Employees e
    INNER JOIN dbo.Departments d ON d.DepartmentId = e.DepartmentId
    WHERE e.EmployeeId = @EmployeeId;
END
GO

IF OBJECT_ID('dbo.sp_Employee_Insert', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_Insert;
GO
CREATE PROCEDURE dbo.sp_Employee_Insert
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(150),
    @Phone NVARCHAR(20) = NULL,
    @Salary DECIMAL(18,2),
    @DepartmentId INT,
    @NewEmployeeId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Employees (FirstName, LastName, Email, Phone, Salary, DateOfJoining, DepartmentId)
    VALUES (@FirstName, @LastName, @Email, @Phone, @Salary, SYSUTCDATETIME(), @DepartmentId);
    SET @NewEmployeeId = SCOPE_IDENTITY();
END
GO

IF OBJECT_ID('dbo.sp_Employee_Update', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_Update;
GO
CREATE PROCEDURE dbo.sp_Employee_Update
    @EmployeeId INT,
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(150),
    @Phone NVARCHAR(20) = NULL,
    @Salary DECIMAL(18,2),
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Employees
    SET FirstName = @FirstName,
        LastName = @LastName,
        Email = @Email,
        Phone = @Phone,
        Salary = @Salary,
        DepartmentId = @DepartmentId
    WHERE EmployeeId = @EmployeeId;
END
GO

IF OBJECT_ID('dbo.sp_Employee_Delete', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_Delete;
GO
CREATE PROCEDURE dbo.sp_Employee_Delete
    @EmployeeId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Employees WHERE EmployeeId = @EmployeeId;
END
GO

IF OBJECT_ID('dbo.sp_Employee_EmailExists', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_Employee_EmailExists;
GO
CREATE PROCEDURE dbo.sp_Employee_EmailExists
    @Email NVARCHAR(150),
    @ExcludeId INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CASE WHEN EXISTS (
        SELECT 1 FROM dbo.Employees WHERE Email = @Email AND EmployeeId <> @ExcludeId
    ) THEN 1 ELSE 0 END AS Result;
END
GO
