using EmployeeDeptApi.DapperAdo.DTOs;
using EmployeeDeptApi.DapperAdo.Models;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDeptApi.DapperAdo.Controllers
{
    // Route group: /api/dapper/departments
    // Uses [FromKeyedServices("dapper")] (.NET 8+ keyed DI) to specifically request
    // the Dapper implementation of IDepartmentRepository - see Program.cs for the
    // AddKeyedScoped registrations that make this resolvable.
    [ApiController]
    [Route("api/dapper/departments")]
    public class DepartmentsDapperController : ControllerBase
    {
        private readonly IDepartmentRepository _repository;

        public DepartmentsDapperController([FromKeyedServices("dapper")] IDepartmentRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
        {
            var departments = await _repository.GetAllAsync();
            return Ok(departments.Select(ToDto));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DepartmentDto>> GetById(int id)
        {
            var department = await _repository.GetByIdAsync(id);
            if (department is null)
                return NotFound(new { message = $"Department with id {id} not found." });

            return Ok(ToDto(department));
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> Create(DepartmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _repository.NameExistsAsync(dto.Name))
                return BadRequest(new { message = $"Department '{dto.Name}' already exists." });

            var department = new Department { Name = dto.Name, Location = dto.Location };
            var newId = await _repository.InsertAsync(department);
            department.DepartmentId = newId;

            return CreatedAtAction(nameof(GetById), new { id = newId }, ToDto(department));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, DepartmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
                return NotFound(new { message = $"Department with id {id} not found." });

            if (await _repository.NameExistsAsync(dto.Name, id))
                return BadRequest(new { message = $"Department '{dto.Name}' already exists." });

            existing.Name = dto.Name;
            existing.Location = dto.Location;
            await _repository.UpdateAsync(existing);

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
                return NotFound(new { message = $"Department with id {id} not found." });

            if (await _repository.HasEmployeesAsync(id))
                return BadRequest(new { message = "Cannot delete department that still has employees assigned." });

            await _repository.DeleteAsync(id);
            return NoContent();
        }

        private static DepartmentDto ToDto(Department d) => new()
        {
            DepartmentId = d.DepartmentId,
            Name = d.Name,
            Location = d.Location
        };
    }
}
