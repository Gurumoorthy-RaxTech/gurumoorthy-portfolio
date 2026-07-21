using EmployeeDeptApi.Data;
using EmployeeDeptApi.Models;
using EmployeeDeptApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDeptApi.Repositories
{
    public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<bool> HasEmployeesAsync(int departmentId) =>
            await _context.Employees.AnyAsync(e => e.DepartmentId == departmentId);

        public async Task<bool> NameExistsAsync(string name, int excludeId = 0) =>
            await _dbSet.AnyAsync(d => d.Name == name && d.DepartmentId != excludeId);
    }
}
