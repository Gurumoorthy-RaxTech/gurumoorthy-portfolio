using EmployeeDeptApi.WinForms.Models;

namespace EmployeeDeptApi.WinForms.Services
{
    // Same abstraction-over-HttpClient idea as the Razor Pages project - forms depend
    // on this interface, never on HttpClient directly.
    public interface IEmployeeApiClient
    {
        Task<(bool Success, LoginResponse? Result, string? Error)> LoginAsync(string username, string password);
        Task<IReadOnlyList<DepartmentApiModel>> GetDepartmentsAsync(string token);
        Task<IReadOnlyList<EmployeeApiModel>> GetEmployeesAsync(string token);
        Task<(bool Success, string? Error)> CreateEmployeeAsync(string token, EmployeeCreateModel employee);
        Task<(bool Success, string? Error)> DeleteEmployeeAsync(string token, int employeeId);
    }
}
