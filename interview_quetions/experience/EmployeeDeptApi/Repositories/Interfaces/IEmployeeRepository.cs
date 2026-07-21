using EmployeeDeptApi.Models;

namespace EmployeeDeptApi.Repositories.Interfaces
{
    // Extends generic repo with Employee-specific queries - Open/Closed Principle:
    // we extend behavior without modifying GenericRepository<T>.
    public interface IEmployeeRepository : IGenericRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetAllWithDepartmentAsync();
        Task<Employee?> GetByIdWithDepartmentAsync(int id);
        Task<bool> EmailExistsAsync(string email, int excludeId = 0);
    }
}
