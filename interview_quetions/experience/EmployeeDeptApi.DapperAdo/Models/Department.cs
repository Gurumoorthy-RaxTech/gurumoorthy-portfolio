namespace EmployeeDeptApi.DapperAdo.Models
{
    // Plain POCO - no EF Core attributes needed. Dapper and ADO.NET both map
    // query results onto this by column name (Dapper automatically, ADO.NET manually).
    public class Department
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
    }
}
