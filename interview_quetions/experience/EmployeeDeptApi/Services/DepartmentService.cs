using EmployeeDeptApi.DTOs;
using EmployeeDeptApi.Models;
using EmployeeDeptApi.Repositories.Interfaces;
using EmployeeDeptApi.Services.Interfaces;

namespace EmployeeDeptApi.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentService(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
        {
            var departments = await _departmentRepository.GetAllAsync();
            return departments.Select(ToDto);
        }

        public async Task<DepartmentDto?> GetByIdAsync(int id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            return department is null ? null : ToDto(department);
        }

        public async Task<(bool Success, string? Error, DepartmentDto? Result)> CreateAsync(DepartmentCreateDto dto)
        {
            if (await _departmentRepository.NameExistsAsync(dto.Name))
                return (false, $"Department '{dto.Name}' already exists.", null);

            var department = new Department { Name = dto.Name, Location = dto.Location };
            await _departmentRepository.AddAsync(department);
            await _departmentRepository.SaveChangesAsync();
            return (true, null, ToDto(department));
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(int id, DepartmentCreateDto dto)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department is null)
                return (false, $"Department with id {id} not found.");

            if (await _departmentRepository.NameExistsAsync(dto.Name, id))
                return (false, $"Department '{dto.Name}' already exists.");

            department.Name = dto.Name;
            department.Location = dto.Location;
            _departmentRepository.Update(department);
            await _departmentRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department is null)
                return (false, $"Department with id {id} not found.");

            if (await _departmentRepository.HasEmployeesAsync(id))
                return (false, "Cannot delete department that still has employees assigned.");

            _departmentRepository.Remove(department);
            await _departmentRepository.SaveChangesAsync();
            return (true, null);
        }

        private static DepartmentDto ToDto(Department d) => new()
        {
            DepartmentId = d.DepartmentId,
            Name = d.Name,
            Location = d.Location
        };
    }
}
