namespace UnitBarcodeScanner.Api.Models;

/// <summary>
/// POCO matching the Unit table (see Database/CreateTables.sql).
/// </summary>
public class Unit
{
    public int UnitId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
