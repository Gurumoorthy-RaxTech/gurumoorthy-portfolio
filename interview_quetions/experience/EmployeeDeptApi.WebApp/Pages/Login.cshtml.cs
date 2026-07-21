using EmployeeDeptApi.WebApp.Models;
using EmployeeDeptApi.WebApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace EmployeeDeptApi.WebApp.Pages;

public class LoginModel : PageModel
{
    private readonly IEmployeeApiClient _apiClient;

    [BindProperty]
    public LoginViewModel Input { get; set; } = new();

    public string? ErrorMessage { get; set; }

    // Constructor injection again - LoginModel depends on IEmployeeApiClient (the
    // abstraction), not on EmployeeApiClient/HttpClient directly.
    public LoginModel(IEmployeeApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public IActionResult OnGet()
    {
        // Already logged in? Skip straight to the dashboard.
        if (!string.IsNullOrEmpty(HttpContext.Session.GetString("JwtToken")))
            return RedirectToPage("/Dashboard");

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        var (success, result, error) = await _apiClient.LoginAsync(Input.Username, Input.Password);

        if (!success || result is null)
        {
            ErrorMessage = error ?? "Login failed. Please try again.";
            return Page();
        }

        // Demo-simple session-based auth: store the raw JWT in the server-side session
        // and check for its presence on protected pages (see Dashboard.cshtml.cs).
        // A production app would instead sign in with ASP.NET Core Cookie Authentication
        // here and stash the JWT as a claim, so [Authorize] attributes work directly.
        HttpContext.Session.SetString("JwtToken", result.Token);
        HttpContext.Session.SetString("Username", Input.Username);

        return RedirectToPage("/Dashboard");
    }
}
