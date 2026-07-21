namespace EmployeeDeptApi.WinForms.Models
{
    // Same shapes as the Razor Pages project (EmployeeDeptApi.WebApp) - both clients
    // talk to the exact same EmployeeDeptApi, just over a desktop UI instead of HTML.

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
    }

    public class DepartmentApiModel
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
    }

    public class EmployeeApiModel
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public decimal Salary { get; set; }
        public DateTime DateOfJoining { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
    }

    public class EmployeeCreateModel
    {
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public decimal Salary { get; set; }
        public int DepartmentId { get; set; }
    }

    public class ApiErrorResponse
    {
        public string? Message { get; set; }
    }
}
