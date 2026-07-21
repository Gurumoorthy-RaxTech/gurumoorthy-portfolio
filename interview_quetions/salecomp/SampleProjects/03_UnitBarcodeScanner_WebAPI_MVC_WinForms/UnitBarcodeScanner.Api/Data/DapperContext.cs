using System.Data;
using Microsoft.Data.SqlClient;

namespace UnitBarcodeScanner.Api.Data;

/// <summary>
/// Tiny wrapper around the connection string so repositories don't each
/// need to know how to read configuration - they just ask for a connection.
/// Registered as Scoped in DI (see Program.cs); a new SqlConnection is
/// handed out per call, which is the normal Dapper pattern (SqlConnection
/// is cheap to create thanks to ADO.NET's underlying connection pooling).
/// </summary>
public class DapperContext
{
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("SchoolDb")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:SchoolDb in appsettings.json");
    }

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
