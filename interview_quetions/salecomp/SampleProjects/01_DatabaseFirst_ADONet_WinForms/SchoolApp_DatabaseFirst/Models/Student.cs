namespace SchoolApp.Models
{
    // Plain C# class ("POCO") that mirrors one row of the Students table.
    // In Database-First, this class is written to MATCH an existing table -
    // property names/types here should line up with the columns SELECTed in StudentRepository.
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public int Age { get; set; }
        public string Email { get; set; }
    }
}
