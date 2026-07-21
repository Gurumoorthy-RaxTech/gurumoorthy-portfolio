using EmployeeDeptApi.DapperAdo.Models;

namespace EmployeeDeptApi.DapperAdo.Repositories.Interfaces
{
    // Same contract is implemented twice: once with Dapper, once with raw ADO.NET.
    // Controllers depend only on this interface, so swapping implementations is a
    // one-line change in Program.cs - the point being made is "the data access
    // *technology* is an implementation detail, not something the rest of the app
    // should care about" (Dependency Inversion again).
    public interface IDepartmentRepository
    {
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(int id);
        Task<int> InsertAsync(Department department);
        Task<bool> UpdateAsync(Department department);
        Task<bool> DeleteAsync(int id);
        Task<bool> NameExistsAsync(string name, int excludeId = 0);
        Task<bool> HasEmployeesAsync(int departmentId);
    }
}
