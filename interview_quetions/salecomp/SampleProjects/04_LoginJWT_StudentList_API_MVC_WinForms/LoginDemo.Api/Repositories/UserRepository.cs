using Dapper;
using LoginDemo.Api.Data;
using LoginDemo.Api.Models;

namespace LoginDemo.Api.Repositories;

/// <summary>All data access for AppUser lives here, via Dapper (raw SQL).</summary>
public class UserRepository : IUserRepository
{
    private readonly DapperContext _context;

    public UserRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<AppUser?> GetByUsernameAsync(string username)
    {
        using var connection = _context.CreateConnection();

        const string sql = @"
            SELECT UserId, Username, PasswordHash, FullName, CreatedDate
            FROM AppUser
            WHERE Username = @Username;";

        return await connection.QuerySingleOrDefaultAsync<AppUser>(sql, new { Username = username });
    }
}
