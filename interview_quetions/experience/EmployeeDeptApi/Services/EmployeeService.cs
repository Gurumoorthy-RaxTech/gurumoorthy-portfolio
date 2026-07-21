using EmployeeDeptApi.DTOs;
using EmployeeDeptApi.Models;
using EmployeeDeptApi.Repositories.Interfaces;
using EmployeeDeptApi.Services.Interfaces;

namespace EmployeeDeptApi.Services
{
    // Business logic layer. Depends on IEmployeeRepository / IDepartmentRepository (abstractions),
    // not concrete EF Core classes -> Dependency Inversion Principle.
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public EmployeeService(IEmployeeRepository employeeRepository, IDepartmentRepository departmentRepository)
        {
            _employeeRepository = employeeRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllAsync()
        {
            var employees = await _employeeRepository.GetAllWithDepartmentAsync();
            return employees.Select(ToDto);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdWithDepartmentAsync(id);
            return employee is null ? null : ToDto(employee);
        }

        public async Task<(bool Success, string? Error, EmployeeDto? Result)> CreateAsync(EmployeeCreateDto dto)
        {
            var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
            if (department is null)
                return (false, $"Department with id {dto.DepartmentId} does not exist.", null);

            if (await _employeeRepository.EmailExistsAsync(dto.Email))
                return (false, $"Email '{dto.Email}' is already in use.", null);

            var employee = new Employee
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Salary = dto.Salary,
                DepartmentId = dto.DepartmentId,
                DateOfJoining = DateTime.UtcNow
            };

            await _employeeRepository.AddAsync(employee);
            await _employeeRepository.SaveChangesAsync();

            employee.Department = department;
            return (true, null, ToDto(employee));
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(int id, EmployeeCreateDto dto)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee is null)
                return (false, $"Employee with id {id} not found.");

            var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
            if (department is null)
                return (false, $"Department with id {dto.DepartmentId} does not exist.");

            if (await _employeeRepository.EmailExistsAsync(dto.Email, id))
                return (false, $"Email '{dto.Email}' is already in use.");

            employee.FirstName = dto.FirstName;
            employee.LastName = dto.LastName;
            employee.Email = dto.Email;
            employee.Phone = dto.Phone;
            employee.Salary = dto.Salary;
            employee.DepartmentId = dto.DepartmentId;

            _employeeRepository.Update(employee);
            await _employeeRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee is null)
                return (false, $"Employee with id {id} not found.");

            _employeeRepository.Remove(employee);
            await _employeeRepository.SaveChangesAsync();
            return (true, null);
        }

        private static EmployeeDto ToDto(Employee e) => new()
        {
            EmployeeId = e.EmployeeId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            Phone = e.Phone,
            Salary = e.Salary,
            DateOfJoining = e.DateOfJoining,
            DepartmentId = e.DepartmentId,
            DepartmentName = e.Department?.Name
        };
    }
}
