namespace LoginDemo.Web.Models;

/// <summary>
/// Local mirror of the API's Student shape. Deliberately NOT a shared
/// project reference to LoginDemo.Api - this project stays independently
/// deployable and only talks to the API over HTTP, the same way a real
/// separate client app would.
/// </summary>
public class StudentItem
{
    public int StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
}
