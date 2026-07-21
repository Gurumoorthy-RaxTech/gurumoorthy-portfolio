using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace EmployeeDeptApi.WebApp.Pages;

// Root "/" just routes to the right place depending on session state -
// keeps Login and Dashboard as the two real pages the task asked for.
public class IndexModel : PageModel
{
    public IActionResult OnGet()
    {
        var token = HttpContext.Session.GetString("JwtToken");
        return string.IsNullOrEmpty(token)
            ? RedirectToPage("/Login")
            : RedirectToPage("/Dashboard");
    }
}
