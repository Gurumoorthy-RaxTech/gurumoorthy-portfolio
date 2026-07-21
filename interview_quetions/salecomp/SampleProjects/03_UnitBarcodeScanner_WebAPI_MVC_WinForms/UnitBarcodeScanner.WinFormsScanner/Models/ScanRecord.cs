namespace UnitBarcodeScanner.WinFormsScanner.Models;

/// <summary>
/// Local DTO, same shape as the API's ScanHistoryDto. Used to bind the
/// DataGridView on Form1.
/// </summary>
public class ScanRecord
{
    public int HistoryId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string OperatorName { get; set; } = string.Empty;
    public DateTime ScanTime { get; set; }
}
