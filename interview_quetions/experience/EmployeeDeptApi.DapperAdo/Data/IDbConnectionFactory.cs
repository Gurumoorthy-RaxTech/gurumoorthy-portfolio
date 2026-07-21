using System.Data;

namespace EmployeeDeptApi.DapperAdo.Data
{
    // Abstraction over "how do I get a DB connection". Both the Dapper repos and the
    // ADO.NET repos depend on this interface, not on SqlConnection directly - keeps
    // the connection string/creation logic in exactly one place (Single Responsibility).
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
