using EmployeeDeptApi.DapperAdo.DTOs;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDeptApi.DapperAdo.Controllers
{
    // Route group: /api/dapper/employees
    [ApiController]
    [Route("api/dapper/employees")]
    public class EmployeesDapperController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public EmployeesDapperController(
            [FromKeyedServices("dapper")] IEmployeeRepository employeeRepository,
            [FromKeyedServices("dapper")] IDepartmentRepository departmentRepository)
        {
            _employeeRepository = employeeRepository;
            _departmentRepository = departmentRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            var employees = await _employeeRepository.GetAllAsync();
            return Ok(employees.Select(ToDto));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<EmployeeDto>> GetById(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee is null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            return Ok(ToDto(employee));
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
            if (department is null)
                return BadRequest(new { message = $"Department with id {dto.DepartmentId} does not exist." });

            if (await _employeeRepository.EmailExistsAsync(dto.Email))
                return BadRequest(new { message = $"Email '{dto.Email}' is already in use." });

            var employee = new Employee
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Salary = dto.Salary,
                DepartmentId = dto.DepartmentId
            };

            var newId = await _employeeRepository.InsertAsync(employee);
            employee.EmployeeId = newId;
            employee.DepartmentName = department.Name;
            employee.DateOfJoining = DateTime.UtcNow;

            return CreatedAtAction(nameof(GetById), new { id = newId }, ToDto(employee));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, EmployeeCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _employeeRepository.GetByIdAsync(id);
            if (existing is null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
            if (department is null)
                return BadRequest(new { message = $"Department with id {dto.DepartmentId} does not exist." });

            if (await _employeeRepository.EmailExistsAsync(dto.Email, id))
                return BadRequest(new { message = $"Email '{dto.Email}' is already in use." });

            existing.FirstName = dto.FirstName;
            existing.LastName = dto.LastName;
            existing.Email = dto.Email;
            existing.Phone = dto.Phone;
            existing.Salary = dto.Salary;
            existing.DepartmentId = dto.DepartmentId;

            await _employeeRepository.UpdateAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _employeeRepository.GetByIdAsync(id);
            if (existing is null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            await _employeeRepository.DeleteAsync(id);
            return NoContent();
        }

        private static EmployeeDto ToDto(Employee e) => new()
        {
            EmployeeId = e.EmployeeId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            Phone = e.Phone,
            Salary = e.Salary,
            DateOfJoining = e.DateOfJoining,
            DepartmentId = e.DepartmentId,
            DepartmentName = e.DepartmentName
        };
    }
}
