using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using LoginDemo.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LoginDemo.Web.Controllers;

public class StudentController : Controller
{
    private readonly ILogger<StudentController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public StudentController(ILogger<StudentController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Reads the JWT out of session (put there by AccountController.Login)
    /// and calls the API's GET api/students with it as a Bearer token. The
    /// browser never sees the API or the token directly - only this
    /// server-side action does, via IHttpClientFactory.
    /// </summary>
    public async Task<IActionResult> Index()
    {
        var token = HttpContext.Session.GetString(AccountController.TokenSessionKey);
        if (string.IsNullOrEmpty(token))
        {
            return RedirectToAction("Login", "Account");
        }

        var client = _httpClientFactory.CreateClient("LoginApi");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        List<StudentItem> students;
        try
        {
            var response = await client.GetAsync("api/students");
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                // Token missing/expired/invalid - send the user back to login.
                HttpContext.Session.Clear();
                return RedirectToAction("Login", "Account");
            }

            students = await response.Content.ReadFromJsonAsync<List<StudentItem>>() ?? new List<StudentItem>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load students from the API.");
            students = new List<StudentItem>();
        }

        ViewBag.FullName = HttpContext.Session.GetString(AccountController.FullNameSessionKey);
        return View(students);
    }
}
