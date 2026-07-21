namespace UnitBarcodeScanner.Web.Models;

/// <summary>
/// ViewModel for the Home/Index page: an input pair (Barcode/OperatorName)
/// for the scan form, plus the History list fetched from the Web API.
/// </summary>
public class UnitScanViewModel
{
    public string Barcode { get; set; } = string.Empty;
    public string OperatorName { get; set; } = string.Empty;
    public List<ScanHistoryItem> History { get; set; } = new();
}

/// <summary>
/// Local mirror of the API's ScanHistoryDto shape. Deliberately NOT a
/// shared project reference to UnitBarcodeScanner.Api - this project stays
/// independently deployable and only talks to the API over HTTP, the same
/// way a real separate client app would.
/// </summary>
public class ScanHistoryItem
{
    public int HistoryId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string OperatorName { get; set; } = string.Empty;
    public DateTime ScanTime { get; set; }
}
