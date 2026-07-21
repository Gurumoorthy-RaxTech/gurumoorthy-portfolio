using System.Data;
using Microsoft.Data.SqlClient;

namespace EmployeeDeptApi.DapperAdo.Data
{
    public class SqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection is not configured.");
        }

        // A new SqlConnection per call - Dapper/ADO.NET code opens it, uses it,
        // and disposes it (via `using`) rather than holding one open for the request,
        // unlike EF Core's DbContext which IS held for the whole scoped lifetime.
        public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
    }
}
