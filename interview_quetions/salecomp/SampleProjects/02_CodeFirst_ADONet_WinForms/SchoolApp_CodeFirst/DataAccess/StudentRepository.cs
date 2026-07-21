using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using SchoolApp.Models;

namespace SchoolApp.DataAccess
{
    // Pure ADO.NET data access - no EF, no Dapper. Every method opens its own
    // connection in a "using" block so it is always closed/returned to the pool,
    // even if an exception is thrown.
    public class StudentRepository
    {
        private readonly string _connectionString;

        public StudentRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["SchoolDb"].ConnectionString;
        }

        public List<Student> GetAll()
        {
            var list = new List<Student>();
            const string sql = "SELECT Id, Name, ClassName, Age, Email FROM Students ORDER BY Name";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new Student
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            ClassName = reader.IsDBNull(2) ? "" : reader.GetString(2),
                            Age = reader.GetInt32(3),
                            Email = reader.IsDBNull(4) ? "" : reader.GetString(4)
                        });
                    }
                }
            }
            return list;
        }

        public List<Student> Search(string keyword)
        {
            var list = new List<Student>();
            const string sql = "SELECT Id, Name, ClassName, Age, Email FROM Students WHERE Name LIKE @Keyword ORDER BY Name";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Keyword", "%" + keyword + "%");
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new Student
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            ClassName = reader.IsDBNull(2) ? "" : reader.GetString(2),
                            Age = reader.GetInt32(3),
                            Email = reader.IsDBNull(4) ? "" : reader.GetString(4)
                        });
                    }
                }
            }
            return list;
        }

        public int Insert(Student s)
        {
            const string sql = @"INSERT INTO Students (Name, ClassName, Age, Email)
                                  VALUES (@Name, @ClassName, @Age, @Email);
                                  SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Name", s.Name);
                cmd.Parameters.AddWithValue("@ClassName", (object)s.ClassName ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Age", s.Age);
                cmd.Parameters.AddWithValue("@Email", (object)s.Email ?? DBNull.Value);
                conn.Open();
                return (int)cmd.ExecuteScalar();
            }
        }

        public void Update(Student s)
        {
            const string sql = @"UPDATE Students
                                  SET Name = @Name, ClassName = @ClassName, Age = @Age, Email = @Email
                                  WHERE Id = @Id";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Name", s.Name);
                cmd.Parameters.AddWithValue("@ClassName", (object)s.ClassName ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Age", s.Age);
                cmd.Parameters.AddWithValue("@Email", (object)s.Email ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Id", s.Id);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public void Delete(int id)
        {
            const string sql = "DELETE FROM Students WHERE Id = @Id";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Id", id);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
