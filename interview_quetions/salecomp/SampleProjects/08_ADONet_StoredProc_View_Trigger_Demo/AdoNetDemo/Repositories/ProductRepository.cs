using System.Data;
using AdoNetDemo.Models;
using Microsoft.Data.SqlClient;

namespace AdoNetDemo.Repositories
{
    // Pure ADO.NET data access - no ORM, no EF, no Dapper. Every method opens
    // its own connection in a "using" block so it is always closed/returned
    // to the pool, even if an exception is thrown. Same pattern as sibling
    // project 01's StudentRepository.cs, just using Microsoft.Data.SqlClient
    // (the modern, actively-maintained driver) instead of System.Data.SqlClient.
    public class ProductRepository
    {
        private readonly string _connectionString;

        public ProductRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Plain parameterized INSERT. This is the ONLY place in the whole demo
        // that writes to Product - and it is what fires trg_Product_Insert,
        // which in turn writes a row into ProductAudit as a side effect.
        public int InsertProduct(string name, decimal price, int stock)
        {
            const string sql = @"INSERT INTO Product (Name, Price, Stock)
                                  VALUES (@Name, @Price, @Stock);
                                  SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Name", name);
                cmd.Parameters.AddWithValue("@Price", price);
                cmd.Parameters.AddWithValue("@Stock", stock);
                conn.Open();
                // ExecuteScalar, not ExecuteNonQuery, because the SQL text
                // SELECTs the new identity value straight back.
                return (int)cmd.ExecuteScalar();
            }
        }

        // Calls sp_GetProductById via CommandType.StoredProcedure instead of
        // inline SQL text - the parameter is still fully parameterized, so
        // this is exactly as safe from SQL injection as the raw-text queries.
        public Product? GetProductById(int id)
        {
            const string sql = "sp_GetProductById";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@ProductId", id));
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new Product
                        {
                            ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Stock = reader.GetInt32(reader.GetOrdinal("Stock"))
                        };
                    }
                }
            }
            return null;
        }

        // Plain SELECT against vw_LowStockProducts - a reusable, named,
        // filtered view instead of every caller re-typing "WHERE Stock < 10".
        public List<Product> GetLowStockProducts()
        {
            var list = new List<Product>();
            const string sql = "SELECT ProductId, Name, Price, Stock FROM vw_LowStockProducts ORDER BY Stock";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new Product
                        {
                            ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Stock = reader.GetInt32(reader.GetOrdinal("Stock"))
                        });
                    }
                }
            }
            return list;
        }

        // Reads back ProductAudit for one product. The app never inserts into
        // ProductAudit directly - any row this returns was written by the
        // trigger, so this method is how the demo PROVES the trigger fired.
        public List<ProductAuditEntry> GetAuditTrail(int productId)
        {
            var list = new List<ProductAuditEntry>();
            const string sql = @"SELECT AuditId, ProductId, Action, ActionDate
                                  FROM ProductAudit
                                  WHERE ProductId = @ProductId
                                  ORDER BY ActionDate DESC";

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@ProductId", productId);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new ProductAuditEntry
                        {
                            AuditId = reader.GetInt32(reader.GetOrdinal("AuditId")),
                            ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                            Action = reader.GetString(reader.GetOrdinal("Action")),
                            ActionDate = reader.GetDateTime(reader.GetOrdinal("ActionDate"))
                        });
                    }
                }
            }
            return list;
        }
    }
}
