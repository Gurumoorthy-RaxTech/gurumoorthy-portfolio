using System.Net.Http.Json;
using UnitBarcodeScanner.WinFormsScanner.Models;

namespace UnitBarcodeScanner.WinFormsScanner.Services;

/// <summary>
/// Thin wrapper around HttpClient for talking to UnitBarcodeScanner.Api.
/// This is a desktop app, not a browser, so CORS never applies here - it's
/// just a plain outbound HTTP call.
/// </summary>
public class ApiClient
{
    // Must match the "http" profile's applicationUrl in
    // UnitBarcodeScanner.Api/Properties/launchSettings.json.
    private const string BaseUrl = "http://localhost:5199/";

    private readonly HttpClient _httpClient;

    public ApiClient()
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(BaseUrl)
        };
    }

    public async Task<bool> SaveUnitAsync(string barcode, string operatorName)
    {
        var response = await _httpClient.PostAsJsonAsync("api/unit/save", new
        {
            Barcode = barcode,
            OperatorName = operatorName
        });

        return response.IsSuccessStatusCode;
    }

    public async Task<List<ScanRecord>> GetHistoryAsync()
    {
        var history = await _httpClient.GetFromJsonAsync<List<ScanRecord>>("api/scanhistory");
        return history ?? new List<ScanRecord>();
    }
}
