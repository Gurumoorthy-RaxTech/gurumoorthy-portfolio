using System.ComponentModel.DataAnnotations;

namespace EmployeeDeptApi.DTOs
{
    public class DepartmentDto
    {
        public int DepartmentId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }
    }

    public class DepartmentCreateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }
    }
}
