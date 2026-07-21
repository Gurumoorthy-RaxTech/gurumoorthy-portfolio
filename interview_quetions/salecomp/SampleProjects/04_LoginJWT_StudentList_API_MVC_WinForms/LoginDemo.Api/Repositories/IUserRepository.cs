using LoginDemo.Api.Models;

namespace LoginDemo.Api.Repositories;

public interface IUserRepository
{
    Task<AppUser?> GetByUsernameAsync(string username);
}
