namespace backend.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal FeeDue { get; set; }
    public bool FeesPaid { get; set; }
}
