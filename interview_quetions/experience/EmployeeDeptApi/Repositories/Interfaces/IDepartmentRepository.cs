using EmployeeDeptApi.Models;

namespace EmployeeDeptApi.Repositories.Interfaces
{
    public interface IDepartmentRepository : IGenericRepository<Department>
    {
        Task<bool> HasEmployeesAsync(int departmentId);
        Task<bool> NameExistsAsync(string name, int excludeId = 0);
    }
}
