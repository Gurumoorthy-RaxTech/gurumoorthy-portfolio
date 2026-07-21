namespace SchoolApp.Models
{
    // Plain C# class ("POCO") that represents one Student row.
    // In Code-First, THIS class is the source of truth - DatabaseInitializer.cs
    // reads it (conceptually) and generates the matching CREATE TABLE statement.
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public int Age { get; set; }
        public string Email { get; set; }
    }
}
