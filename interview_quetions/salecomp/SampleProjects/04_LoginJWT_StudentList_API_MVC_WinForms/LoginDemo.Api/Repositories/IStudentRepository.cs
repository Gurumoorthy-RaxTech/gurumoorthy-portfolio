using LoginDemo.Api.Models;

namespace LoginDemo.Api.Repositories;

public interface IStudentRepository
{
    Task<IEnumerable<Student>> GetAllAsync();
}
