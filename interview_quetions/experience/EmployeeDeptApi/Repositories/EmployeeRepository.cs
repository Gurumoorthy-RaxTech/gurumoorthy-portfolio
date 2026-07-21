using EmployeeDeptApi.Data;
using EmployeeDeptApi.Models;
using EmployeeDeptApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDeptApi.Repositories
{
    public class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Employee>> GetAllWithDepartmentAsync() =>
            await _dbSet.Include(e => e.Department).ToListAsync();

        public async Task<Employee?> GetByIdWithDepartmentAsync(int id) =>
            await _dbSet.Include(e => e.Department).FirstOrDefaultAsync(e => e.EmployeeId == id);

        public async Task<bool> EmailExistsAsync(string email, int excludeId = 0) =>
            await _dbSet.AnyAsync(e => e.Email == email && e.EmployeeId != excludeId);
    }
}
