namespace LoginDemo.Api.Models;

/// <summary>POCO matching the Student table.</summary>
public class Student
{
    public int StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
