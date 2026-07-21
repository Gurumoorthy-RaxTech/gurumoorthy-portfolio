using System.Data;
using EmployeeDeptApi.DapperAdo.Data;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace EmployeeDeptApi.DapperAdo.Repositories.Ado
{
    // Raw ADO.NET: no library does the mapping for you. You open the connection,
    // build the SqlCommand + SqlParameters by hand, read the SqlDataReader column by
    // column, and close everything yourself (via `using`). This is what Dapper and
    // EF Core are built on top of internally - useful to be able to explain this
    // when asked "what actually happens under the hood".
    public class AdoDepartmentRepository : IDepartmentRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public AdoDepartmentRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            var results = new List<Department>();

            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_GetAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(MapDepartment(reader));
            }

            return results;
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_GetById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = id });

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapDepartment(reader) : null;
        }

        public async Task<int> InsertAsync(Department department)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_Insert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@Name", SqlDbType.NVarChar, 100) { Value = department.Name });
            command.Parameters.Add(new SqlParameter("@Location", SqlDbType.NVarChar, 200)
            {
                Value = (object?)department.Location ?? DBNull.Value
            });

            // OUTPUT parameter: direction must be set explicitly, and read back
            // from command.Parameters AFTER ExecuteNonQueryAsync completes.
            var outputIdParam = new SqlParameter("@NewDepartmentId", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(outputIdParam);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            return (int)outputIdParam.Value;
        }

        public async Task<bool> UpdateAsync(Department department)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_Update", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = department.DepartmentId });
            command.Parameters.Add(new SqlParameter("@Name", SqlDbType.NVarChar, 100) { Value = department.Name });
            command.Parameters.Add(new SqlParameter("@Location", SqlDbType.NVarChar, 200)
            {
                Value = (object?)department.Location ?? DBNull.Value
            });

            await connection.OpenAsync();
            var rows = await command.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_Delete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = id });

            await connection.OpenAsync();
            var rows = await command.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> NameExistsAsync(string name, int excludeId = 0)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_NameExists", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@Name", SqlDbType.NVarChar, 100) { Value = name });
            command.Parameters.Add(new SqlParameter("@ExcludeId", SqlDbType.Int) { Value = excludeId });

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            return Convert.ToBoolean(result);
        }

        public async Task<bool> HasEmployeesAsync(int departmentId)
        {
            using var connection = (SqlConnection)_connectionFactory.CreateConnection();
            using var command = new SqlCommand("sp_Department_HasEmployees", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@DepartmentId", SqlDbType.Int) { Value = departmentId });

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            return Convert.ToBoolean(result);
        }

        private static Department MapDepartment(SqlDataReader reader) => new()
        {
            DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
            Name = reader.GetString(reader.GetOrdinal("Name")),
            Location = reader.IsDBNull(reader.GetOrdinal("Location")) ? null : reader.GetString(reader.GetOrdinal("Location"))
        };
    }
}
