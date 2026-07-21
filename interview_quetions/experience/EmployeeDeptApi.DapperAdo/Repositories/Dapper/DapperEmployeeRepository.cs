using System.Data;
using Dapper;
using EmployeeDeptApi.DapperAdo.Data;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;

namespace EmployeeDeptApi.DapperAdo.Repositories.Dapper
{
    public class DapperEmployeeRepository : IEmployeeRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public DapperEmployeeRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Employee>(
                "sp_Employee_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Employee>(
                "sp_Employee_GetById",
                new { EmployeeId = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> InsertAsync(Employee employee)
        {
            using var connection = _connectionFactory.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("FirstName", employee.FirstName);
            parameters.Add("LastName", employee.LastName);
            parameters.Add("Email", employee.Email);
            parameters.Add("Phone", employee.Phone);
            parameters.Add("Salary", employee.Salary);
            parameters.Add("DepartmentId", employee.DepartmentId);
            parameters.Add("NewEmployeeId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_Employee_Insert",
                parameters,
                commandType: CommandType.StoredProcedure);

            return parameters.Get<int>("NewEmployeeId");
        }

        public async Task<bool> UpdateAsync(Employee employee)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "sp_Employee_Update",
                new
                {
                    employee.EmployeeId,
                    employee.FirstName,
                    employee.LastName,
                    employee.Email,
                    employee.Phone,
                    employee.Salary,
                    employee.DepartmentId
                },
                commandType: CommandType.StoredProcedure);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "sp_Employee_Delete",
                new { EmployeeId = id },
                commandType: CommandType.StoredProcedure);
            return rows > 0;
        }

        public async Task<bool> EmailExistsAsync(string email, int excludeId = 0)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<bool>(
                "sp_Employee_EmailExists",
                new { Email = email, ExcludeId = excludeId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
