using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using LoginDemo.Web.Models;

namespace LoginDemo.Web.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// This app's "start page" is really just a traffic director: if the
    /// session already has a JWT (from a previous AccountController.Login),
    /// go straight to the student list; otherwise send the user to Login.
    /// </summary>
    public IActionResult Index()
    {
        if (!string.IsNullOrEmpty(HttpContext.Session.GetString(AccountController.TokenSessionKey)))
        {
            return RedirectToAction("Index", "Student");
        }

        return RedirectToAction("Login", "Account");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
