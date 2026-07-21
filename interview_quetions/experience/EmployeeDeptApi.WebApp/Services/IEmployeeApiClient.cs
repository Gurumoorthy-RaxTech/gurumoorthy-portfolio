using EmployeeDeptApi.WebApp.Models;

namespace EmployeeDeptApi.WebApp.Services
{
    // Abstraction over the EmployeeDeptApi HTTP calls - Razor Pages code-behind depends
    // on this interface, not on HttpClient directly. Same Dependency Inversion idea
    // used throughout the two API projects.
    public interface IEmployeeApiClient
    {
        Task<(bool Success, LoginResponse? Result, string? Error)> LoginAsync(string username, string password);
        Task<IReadOnlyList<DepartmentApiModel>> GetDepartmentsAsync(string token);
        Task<IReadOnlyList<EmployeeApiModel>> GetEmployeesAsync(string token);
    }
}
