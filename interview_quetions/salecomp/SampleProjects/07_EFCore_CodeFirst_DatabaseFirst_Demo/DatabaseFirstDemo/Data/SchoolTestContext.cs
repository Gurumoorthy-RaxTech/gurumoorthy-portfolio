using System;
using System.Collections.Generic;
using DatabaseFirstDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace DatabaseFirstDemo.Data;

// DATABASE-FIRST: this file started as the REAL, scaffolded output of running
// (from this project's folder):
//
//   dotnet ef dbcontext scaffold "<your SchoolTest connection string>" ^
//     Microsoft.EntityFrameworkCore.SqlServer -o Models -c SchoolTestContext --context-dir Data --table "Student.Student" -f
//
// against the real dev SQL Server, on 2026-07-18. That's a READ-ONLY schema
// reflection operation - EF Core queried system catalog views (sys.tables,
// sys.columns, sys.indexes, etc.) to discover the existing Student.Student
// table and generated this DbContext + Models/Student.cs from what it found.
// It did not create, alter, or write anything.
//
// Note the table lives under a "Student" SCHEMA (not the default "dbo"), which
// is why the scaffold command needed --table "Student.Student" (schema.table)
// instead of just --table Student - the first attempt without a schema
// qualifier came back "Unable to find a table in the database matching the
// selected table 'dbo.Student'", which is itself a useful thing to have hit
// once for an interview answer about multi-schema databases.
//
// Re-run the command above any time to regenerate this file from whatever the
// live schema looks like then - that round-trip (existing DB -> scaffold ->
// C# classes) IS Database-First in EF Core.
//
// SECURITY NOTE: the scaffold tool bakes the connection string you pass it
// straight into OnConfiguring() below (see its own #warning about this) - that
// is fine to look at once, but must never be committed with real credentials
// in it. This has been edited to read the connection string from the
// SCHOOLTEST_CONNECTION_STRING environment variable instead. Set it locally
// before running - see README.txt - never hardcode the real value here.
public partial class SchoolTestContext : DbContext
{
    public SchoolTestContext()
    {
    }

    public SchoolTestContext(DbContextOptions<SchoolTestContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Student> Students { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var connectionString = Environment.GetEnvironmentVariable("SCHOOLTEST_CONNECTION_STRING")
            ?? throw new InvalidOperationException(
                "Set the SCHOOLTEST_CONNECTION_STRING environment variable to your local " +
                "SchoolTest connection string before running - see README.txt. " +
                "Never hardcode the real value in this file.");
        optionsBuilder.UseSqlServer(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => new { e.StudentId, e.SchoolId }).HasName("PK_Student.Student");

            entity.ToTable("Student", "Student");

            entity.HasIndex(e => e.StudentId, "IX_Student_Active").HasFilter("([IsActive]=(1))");

            entity.HasIndex(e => new { e.StudentId, e.IsActive }, "IX_Student_IsActive");

            entity.HasIndex(e => new { e.SchoolId, e.AcademicYearId, e.AdmissionNo }, "IX_Student_School_AcademicYear_AdmissionNo");

            entity.HasIndex(e => new { e.StudentId, e.IsActive }, "IX_Student_StudentID_IsActive");

            entity.Property(e => e.StudentId)
                .ValueGeneratedOnAdd()
                .HasColumnName("StudentID");
            entity.Property(e => e.SchoolId).HasColumnName("SchoolID");
            entity.Property(e => e.AcademicYearId).HasColumnName("AcademicYearID");
            entity.Property(e => e.AdmissionNo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DivisionId).HasColumnName("DivisionID");
            entity.Property(e => e.Dob).HasColumnName("DOB");
            entity.Property(e => e.FirstName)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Gender)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.MiddleName)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Photo).IsUnicode(false);
            entity.Property(e => e.RegistrationNo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Sosimei)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("SOSIMEI");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
