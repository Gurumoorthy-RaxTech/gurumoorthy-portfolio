using System.Data;
using Dapper;
using EmployeeDeptApi.DapperAdo.Data;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;

namespace EmployeeDeptApi.DapperAdo.Repositories.Dapper
{
    // Dapper = a lightweight "micro-ORM". It does NOT generate SQL for you (unlike EF Core) -
    // you write the SQL/call the stored procedure yourself, and Dapper's job is just to:
    //   1) map your C# parameters onto SqlParameters, and
    //   2) map the result rows back onto your POCOs by column name.
    // That mapping is done via fast compiled IL, which is why Dapper is close to raw
    // ADO.NET in performance while removing almost all the manual reader/parameter code.
    public class DapperDepartmentRepository : IDepartmentRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public DapperDepartmentRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Department>(
                "sp_Department_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Department>(
                "sp_Department_GetById",
                new { DepartmentId = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> InsertAsync(Department department)
        {
            using var connection = _connectionFactory.CreateConnection();

            // DynamicParameters lets us declare an OUTPUT parameter and read it back
            // after execution - the SP sets @NewDepartmentId = SCOPE_IDENTITY().
            var parameters = new DynamicParameters();
            parameters.Add("Name", department.Name);
            parameters.Add("Location", department.Location);
            parameters.Add("NewDepartmentId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_Department_Insert",
                parameters,
                commandType: CommandType.StoredProcedure);

            return parameters.Get<int>("NewDepartmentId");
        }

        public async Task<bool> UpdateAsync(Department department)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "sp_Department_Update",
                new { department.DepartmentId, department.Name, department.Location },
                commandType: CommandType.StoredProcedure);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "sp_Department_Delete",
                new { DepartmentId = id },
                commandType: CommandType.StoredProcedure);
            return rows > 0;
        }

        public async Task<bool> NameExistsAsync(string name, int excludeId = 0)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<bool>(
                "sp_Department_NameExists",
                new { Name = name, ExcludeId = excludeId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> HasEmployeesAsync(int departmentId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<bool>(
                "sp_Department_HasEmployees",
                new { DepartmentId = departmentId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
