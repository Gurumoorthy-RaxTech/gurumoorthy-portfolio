using EmployeeDeptApi.DTOs;
using EmployeeDeptApi.Filters;
using EmployeeDeptApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDeptApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [ServiceFilter(typeof(LogActionFilter))]
    [TypeFilter(typeof(ValidateModelFilter))]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        // GET api/departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
        {
            var departments = await _departmentService.GetAllAsync();
            return Ok(departments);
        }

        // GET api/departments/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<DepartmentDto>> GetById(int id)
        {
            var department = await _departmentService.GetByIdAsync(id);
            if (department is null)
                return NotFound(new { message = $"Department with id {id} not found." });

            return Ok(department);
        }

        // POST api/departments
        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> Create(DepartmentCreateDto dto)
        {
            var (success, error, result) = await _departmentService.CreateAsync(dto);
            if (!success)
                return BadRequest(new { message = error });

            return CreatedAtAction(nameof(GetById), new { id = result!.DepartmentId }, result);
        }

        // PUT api/departments/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, DepartmentCreateDto dto)
        {
            var (success, error) = await _departmentService.UpdateAsync(id, dto);
            if (!success)
                return error!.Contains("not found") ? NotFound(new { message = error }) : BadRequest(new { message = error });

            return NoContent();
        }

        // DELETE api/departments/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _departmentService.DeleteAsync(id);
            if (!success)
                return error!.Contains("not found") ? NotFound(new { message = error }) : BadRequest(new { message = error });

            return NoContent();
        }
    }
}
