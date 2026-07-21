namespace LoginDemo.WinForms.Models;

/// <summary>
/// Local DTO mirroring the API's Student shape. Bound directly to
/// StudentListForm's DataGridView.
/// </summary>
public class StudentDto
{
    public int StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
}
