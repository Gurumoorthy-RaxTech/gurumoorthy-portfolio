using EmployeeDeptApi.WebApp.Models;
using EmployeeDeptApi.WebApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace EmployeeDeptApi.WebApp.Pages;

public class DashboardModel : PageModel
{
    private readonly IEmployeeApiClient _apiClient;

    public string? Username { get; set; }
    public IReadOnlyList<EmployeeApiModel> Employees { get; set; } = new List<EmployeeApiModel>();
    public IReadOnlyList<DepartmentApiModel> Departments { get; set; } = new List<DepartmentApiModel>();
    public decimal TotalPayroll => Employees.Sum(e => e.Salary);

    public DashboardModel(IEmployeeApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IActionResult> OnGetAsync()
    {
        // Auth guard: no token in session -> bounce to Login. This is the
        // "simple login" version of what [Authorize] + cookie auth would do
        // automatically in a production app.
        var token = HttpContext.Session.GetString("JwtToken");
        if (string.IsNullOrEmpty(token))
            return RedirectToPage("/Login");

        Username = HttpContext.Session.GetString("Username");

        try
        {
            Employees = await _apiClient.GetEmployeesAsync(token);
            Departments = await _apiClient.GetDepartmentsAsync(token);
        }
        catch (HttpRequestException)
        {
            // Token likely expired/rejected by the API (401) - clear session, re-login.
            HttpContext.Session.Clear();
            return RedirectToPage("/Login");
        }

        return Page();
    }

    public IActionResult OnPostLogout()
    {
        HttpContext.Session.Clear();
        return RedirectToPage("/Login");
    }
}
