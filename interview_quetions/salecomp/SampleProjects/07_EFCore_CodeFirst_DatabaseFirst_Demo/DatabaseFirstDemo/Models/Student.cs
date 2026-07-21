using System;
using System.Collections.Generic;

namespace DatabaseFirstDemo.Models;

public partial class Student
{
    public long StudentId { get; set; }

    public string? RegistrationNo { get; set; }

    public DateOnly? AdmissionDate { get; set; }

    public string? AdmissionNo { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public string? NameInTamil { get; set; }

    public string? Gender { get; set; }

    public DateOnly? Dob { get; set; }

    public string? Photo { get; set; }

    public long? AcademicYearId { get; set; }

    public long SchoolId { get; set; }

    public long? DivisionId { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime? CreatedDate { get; set; }

    public long? UpdatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public bool? IsActive { get; set; }

    public string? Sosimei { get; set; }
}
