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
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        // Constructor (Dependency) Injection - controller depends on IEmployeeService abstraction,
        // resolved from the DI container. Makes the controller unit-testable via a mock service.
        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        // GET api/employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            var employees = await _employeeService.GetAllAsync();
            return Ok(employees);
        }

        // GET api/employees/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EmployeeDto>> GetById(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee is null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            return Ok(employee);
        }

        // POST api/employees
        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto)
        {
            var (success, error, result) = await _employeeService.CreateAsync(dto);
            if (!success)
                return BadRequest(new { message = error });

            return CreatedAtAction(nameof(GetById), new { id = result!.EmployeeId }, result);
        }

        // PUT api/employees/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, EmployeeCreateDto dto)
        {
            var (success, error) = await _employeeService.UpdateAsync(id, dto);
            if (!success)
                return error!.Contains("not found") ? NotFound(new { message = error }) : BadRequest(new { message = error });

            return NoContent();
        }

        // DELETE api/employees/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _employeeService.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = error });

            return NoContent();
        }
    }
}
