using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/students
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetAll()
    {
        var students = await _db.Students.AsNoTracking().ToListAsync();
        return Ok(students);
    }

    // GET /api/students/3
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Student>> GetById(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();
        return Ok(student);
    }

    // POST /api/students
    [HttpPost]
    public async Task<ActionResult<Student>> Create(CreateStudentRequest request)
    {
        var student = new Student
        {
            Name = request.Name,
            RollNumber = request.RollNumber,
            ClassName = request.ClassName,
            Email = request.Email,
            FeeDue = request.FeeDue,
            FeesPaid = request.FeesPaid
        };

        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
    }

    // PUT /api/students/3
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateStudentRequest request)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        student.Name = request.Name;
        student.RollNumber = request.RollNumber;
        student.ClassName = request.ClassName;
        student.Email = request.Email;
        student.FeeDue = request.FeeDue;
        student.FeesPaid = request.FeesPaid;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/students/3
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        _db.Students.Remove(student);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
