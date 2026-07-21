using EmployeeDeptApi.DTOs;

namespace EmployeeDeptApi.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllAsync();
        Task<DepartmentDto?> GetByIdAsync(int id);
        Task<(bool Success, string? Error, DepartmentDto? Result)> CreateAsync(DepartmentCreateDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(int id, DepartmentCreateDto dto);
        Task<(bool Success, string? Error)> DeleteAsync(int id);
    }
}
