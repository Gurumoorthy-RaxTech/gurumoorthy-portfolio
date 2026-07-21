using Microsoft.AspNetCore.Mvc;
using UnitBarcodeScanner.Api.Models.Dtos;
using UnitBarcodeScanner.Api.Repositories;

namespace UnitBarcodeScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitController : ControllerBase
{
    private readonly IUnitRepository _unitRepository;

    public UnitController(IUnitRepository unitRepository)
    {
        _unitRepository = unitRepository;
    }

    /// <summary>
    /// Saves (or reuses) a Unit for the given barcode and records a
    /// ScanHistory row for it. Called by both client UIs whenever a
    /// barcode is scanned.
    /// </summary>
    [HttpPost("save")]
    public async Task<IActionResult> SaveUnit([FromBody] SaveUnitRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Barcode))
        {
            return BadRequest("Barcode is required.");
        }

        var unit = await _unitRepository.SaveUnitAsync(request);
        return Ok(unit);
    }
}
