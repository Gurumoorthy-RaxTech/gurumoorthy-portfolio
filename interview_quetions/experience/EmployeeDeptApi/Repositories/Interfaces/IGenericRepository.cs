using System.Linq.Expressions;

namespace EmployeeDeptApi.Repositories.Interfaces
{
    // Generic Repository Interface - demonstrates Interface Segregation + Dependency Inversion (SOLID)
    // Controllers/Services depend on this abstraction, never on EF Core directly.
    public interface IGenericRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);
        Task<bool> SaveChangesAsync();
    }
}
