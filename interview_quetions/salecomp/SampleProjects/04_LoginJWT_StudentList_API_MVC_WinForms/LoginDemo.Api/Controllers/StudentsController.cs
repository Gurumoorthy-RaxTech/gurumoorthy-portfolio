using LoginDemo.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoginDemo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentRepository _studentRepository;

    public StudentsController(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    /// <summary>
    /// Requires a valid Bearer JWT (see AuthController.Login). Returns the
    /// full Student list - the MVC Web app and the WinForms app both call
    /// this identically, just through a different HttpClient wrapper.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await _studentRepository.GetAllAsync();
        return Ok(students);
    }
}
