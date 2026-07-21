using System.ComponentModel.DataAnnotations;

namespace EmployeeDeptApi.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
