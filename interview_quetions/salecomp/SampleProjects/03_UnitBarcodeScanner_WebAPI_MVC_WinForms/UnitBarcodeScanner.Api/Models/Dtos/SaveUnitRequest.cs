namespace UnitBarcodeScanner.Api.Models.Dtos;

/// <summary>
/// What a client (WinForms scanner or, indirectly, the MVC web app) sends
/// when a barcode is scanned.
/// </summary>
public class SaveUnitRequest
{
    public string Barcode { get; set; } = string.Empty;
    public string OperatorName { get; set; } = string.Empty;
}
