using System.Diagnostics;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using UnitBarcodeScanner.Web.Models;

namespace UnitBarcodeScanner.Web.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public HomeController(ILogger<HomeController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Loads the scan history from the Web API and shows the scan form
    /// plus the history table.
    /// </summary>
    public async Task<IActionResult> Index()
    {
        var client = _httpClientFactory.CreateClient("UnitApi");

        List<ScanHistoryItem> history;
        try
        {
            history = await client.GetFromJsonAsync<List<ScanHistoryItem>>("api/scanhistory")
                ?? new List<ScanHistoryItem>();
        }
        catch (Exception ex)
        {
            // API might not be running yet - don't blow up the page, just
            // show an empty grid and log it.
            _logger.LogError(ex, "Failed to load scan history from the API.");
            history = new List<ScanHistoryItem>();
        }

        var model = new UnitScanViewModel
        {
            Barcode = string.Empty,
            OperatorName = string.Empty,
            History = history
        };

        return View(model);
    }

    /// <summary>
    /// Handles the scan form POST, forwards it to the API's SaveUnit
    /// endpoint, then redirects back to Index (Post-Redirect-Get) so a
    /// browser refresh doesn't resubmit the scan.
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ScanUnit(string barcode, string operatorName)
    {
        if (!string.IsNullOrWhiteSpace(barcode))
        {
            var client = _httpClientFactory.CreateClient("UnitApi");
            try
            {
                await client.PostAsJsonAsync("api/unit/save", new
                {
                    Barcode = barcode,
                    OperatorName = operatorName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save scan via the API.");
            }
        }

        return RedirectToAction(nameof(Index));
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
