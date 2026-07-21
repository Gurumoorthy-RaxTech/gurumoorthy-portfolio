using System.Data;
using EmployeeDeptApi.DapperAdo.Data;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace EmployeeDeptApi.DapperAdo.Repositories.Ado
{
    public class AdoEmployeeRepository : IEmployeeRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public AdoEmployeeRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            var results = new List<Employee>();

            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_GetAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(MapEmployee(reader));
            }

            return results;
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_GetById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = id });

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapEmployee(reader) : null;
        }

        public async Task<int> InsertAsync(Employee employee)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_Insert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@FirstName", SqlDbType.NVarChar, 100) { Value = employee.FirstName });
            command.Parameters.Add(new SqlParameter("@LastName", SqlDbType.NVarChar, 100)
            {
                Value = (object?)employee.LastName ?? DBNull.Value
            });
            command.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 150) { Value = employee.Email });
            command.Parameters.Add(new SqlParameter("@Phone", SqlDbType.NVarChar, 20)
            {
                Value = (object?)employee.Phone ?? DBNull.Value
            });
            command.Parameters.Add(new SqlParameter("@Salary", SqlDbType.Decimal) { Value = employee.Salary });
            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = employee.DepartmentId });

            var outputIdParam = new SqlParameter("@NewEmployeeId", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(outputIdParam);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            return (int)outputIdParam.Value;
        }

        public async Task<bool> UpdateAsync(Employee employee)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_Update", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employee.EmployeeId });
            command.Parameters.Add(new SqlParameter("@FirstName", SqlDbType.NVarChar, 100) { Value = employee.FirstName });
            command.Parameters.Add(new SqlParameter("@LastName", SqlDbType.NVarChar, 100)
            {
                Value = (object?)employee.LastName ?? DBNull.Value
            });
            command.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 150) { Value = employee.Email });
            command.Parameters.Add(new SqlParameter("@Phone", SqlDbType.NVarChar, 20)
            {
                Value = (object?)employee.Phone ?? DBNull.Value
            });
            command.Parameters.Add(new SqlParameter("@Salary", SqlDbType.Decimal) { Value = employee.Salary });
            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = employee.DepartmentId });

            await connection.OpenAsync();
            var rows = await command.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_Delete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = id });

            await connection.OpenAsync();
            var rows = await command.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> EmailExistsAsync(string email, int excludeId = 0)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Employee_EmailExists", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 150) { Value = email });
            command.Parameters.Add(new SqlParameter("@ExcludeId", SqlDbType.Int) { Value = excludeId });

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            return Convert.ToBoolean(result);
        }

        private static Employee MapEmployee(SqlDataReader reader) => new()
        {
            EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId")),
            FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
            LastName = reader.IsDBNull(reader.GetOrdinal("LastName")) ? null : reader.GetString(reader.GetOrdinal("LastName")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            Phone = reader.IsDBNull(reader.GetOrdinal("Phone")) ? null : reader.GetString(reader.GetOrdinal("Phone")),
            Salary = reader.GetDecimal(reader.GetOrdinal("Salary")),
            DateOfJoining = reader.GetDateTime(reader.GetOrdinal("DateOfJoining")),
            DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
            DepartmentName = HasColumn(reader, "DepartmentName") && !reader.IsDBNull(reader.GetOrdinal("DepartmentName"))
                ? reader.GetString(reader.GetOrdinal("DepartmentName"))
                : null
        };

        private static bool HasColumn(SqlDataReader reader, string columnName)
        {
            for (var i = 0; i < reader.FieldCount; i++)
            {
                if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}
