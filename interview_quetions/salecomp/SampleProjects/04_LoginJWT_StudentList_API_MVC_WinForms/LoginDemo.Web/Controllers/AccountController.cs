using System.Net.Http.Json;
using LoginDemo.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LoginDemo.Web.Controllers;

public class AccountController : Controller
{
    internal const string TokenSessionKey = "JwtToken";
    internal const string FullNameSessionKey = "FullName";

    private readonly ILogger<AccountController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public AccountController(ILogger<AccountController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public IActionResult Login()
    {
        if (!string.IsNullOrEmpty(HttpContext.Session.GetString(TokenSessionKey)))
        {
            return RedirectToAction("Index", "Student");
        }

        return View(new LoginViewModel());
    }

    /// <summary>
    /// Calls the API's POST api/auth/login via the named "LoginApi"
    /// HttpClient (server-side only - the browser never calls the API
    /// directly). On success stores the JWT + FullName in session and
    /// redirects to Student/Index; on failure re-shows the form with an
    /// error message.
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var client = _httpClientFactory.CreateClient("LoginApi");

        try
        {
            var response = await client.PostAsJsonAsync("api/auth/login", new
            {
                model.Username,
                model.Password
            });

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginApiResult>();
                if (result is not null)
                {
                    HttpContext.Session.SetString(TokenSessionKey, result.Token);
                    HttpContext.Session.SetString(FullNameSessionKey, result.FullName);
                    return RedirectToAction("Index", "Student");
                }
            }

            model.ErrorMessage = "Invalid username or password.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reach the login API.");
            model.ErrorMessage = "Could not reach the API. Is LoginDemo.Api running?";
        }

        model.Password = string.Empty;
        return View(model);
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return RedirectToAction(nameof(Login));
    }
}
