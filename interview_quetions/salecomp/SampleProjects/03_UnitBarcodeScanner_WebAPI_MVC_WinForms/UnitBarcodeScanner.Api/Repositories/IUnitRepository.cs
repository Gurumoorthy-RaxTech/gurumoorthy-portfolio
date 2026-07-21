using UnitBarcodeScanner.Api.Models;
using UnitBarcodeScanner.Api.Models.Dtos;

namespace UnitBarcodeScanner.Api.Repositories;

public interface IUnitRepository
{
    Task<Unit> SaveUnitAsync(SaveUnitRequest request);
    Task<IEnumerable<ScanHistoryDto>> GetHistoryAsync();
}
