using Microsoft.AspNetCore.Mvc;
using UnitBarcodeScanner.Api.Repositories;

namespace UnitBarcodeScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScanHistoryController : ControllerBase
{
    private readonly IUnitRepository _unitRepository;

    public ScanHistoryController(IUnitRepository unitRepository)
    {
        _unitRepository = unitRepository;
    }

    /// <summary>
    /// Returns every scan, most recent first, joined against Unit so the
    /// caller gets the Barcode text rather than just a UnitId.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _unitRepository.GetHistoryAsync();
        return Ok(history);
    }
}
