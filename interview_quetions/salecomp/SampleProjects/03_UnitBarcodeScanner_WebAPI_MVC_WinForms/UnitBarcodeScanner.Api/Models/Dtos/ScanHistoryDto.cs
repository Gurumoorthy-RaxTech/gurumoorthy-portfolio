namespace UnitBarcodeScanner.Api.Models.Dtos;

/// <summary>
/// Flattened ScanHistory + Unit join result, shaped for display in either
/// client UI (MVC table or WinForms grid).
/// </summary>
public class ScanHistoryDto
{
    public int HistoryId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string OperatorName { get; set; } = string.Empty;
    public DateTime ScanTime { get; set; }
}
