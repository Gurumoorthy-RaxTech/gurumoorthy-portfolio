namespace UnitBarcodeScanner.Api.Models;

/// <summary>
/// POCO matching the ScanHistory table (see Database/CreateTables.sql).
/// UnitId is a foreign key back to Unit - see README.txt for why it was
/// added even though the original task description didn't list it.
/// </summary>
public class ScanHistory
{
    public int HistoryId { get; set; }
    public int UnitId { get; set; }
    public string OperatorName { get; set; } = string.Empty;
    public DateTime ScanTime { get; set; }
}
