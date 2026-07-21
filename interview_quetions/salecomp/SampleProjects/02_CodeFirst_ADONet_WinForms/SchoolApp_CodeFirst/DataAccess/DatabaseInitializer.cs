using System.Configuration;
using System.Data.SqlClient;

namespace SchoolApp.DataAccess
{
    // CODE-FIRST: this class is the ADO.NET equivalent of an EF Core migration.
    // There is no auto-diffing engine here (that's what EF Core adds on top of
    // ADO.NET) - we hand-write the CREATE TABLE and guard it with an IF NOT EXISTS
    // check so it is safe to call this on every single app startup.
    public static class DatabaseInitializer
    {
        public static void EnsureCreated()
        {
            string connectionString = ConfigurationManager.ConnectionStrings["SchoolDb"].ConnectionString;

            const string sql = @"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Students')
                BEGIN
                    CREATE TABLE Students (
                        Id         INT IDENTITY(1,1) PRIMARY KEY,
                        Name       NVARCHAR(100) NOT NULL,
                        ClassName  NVARCHAR(50)  NULL,
                        Age        INT           NOT NULL,
                        Email      NVARCHAR(150) NULL
                    );
                END";

            using (var conn = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand(sql, conn))
            {
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
