using Dapper;
using LoginDemo.Api.Data;
using LoginDemo.Api.Models;

namespace LoginDemo.Api.Repositories;

/// <summary>All data access for Student lives here, via Dapper (raw SQL).</summary>
public class StudentRepository : IStudentRepository
{
    private readonly DapperContext _context;

    public StudentRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Student>> GetAllAsync()
    {
        using var connection = _context.CreateConnection();

        const string sql = @"
            SELECT StudentId, Name, Class, RollNumber, CreatedDate
            FROM Student
            ORDER BY StudentId;";

        return await connection.QueryAsync<Student>(sql);
    }
}
