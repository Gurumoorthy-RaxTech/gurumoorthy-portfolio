namespace EmployeeDeptApi.WebApp.Models
{
    // Shapes matching the JSON the EmployeeDeptApi (project 1) returns.
    // Kept separate from any view-only models so API contract changes
    // don't silently ripple into Razor markup.

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

    public class ApiErrorResponse
    {
        public string? Message { get; set; }
    }
}
