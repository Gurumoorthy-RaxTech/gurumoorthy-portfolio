using EmployeeDeptApi.DTOs;

namespace EmployeeDeptApi.Services.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllAsync();
        Task<EmployeeDto?> GetByIdAsync(int id);
        Task<(bool Success, string? Error, EmployeeDto? Result)> CreateAsync(EmployeeCreateDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(int id, EmployeeCreateDto dto);
        Task<(bool Success, string? Error)> DeleteAsync(int id);
    }
}
