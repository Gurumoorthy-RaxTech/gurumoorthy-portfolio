using System.Net.Http.Headers;
using System.Net.Http.Json;
using LoginDemo.WinForms.Models;

namespace LoginDemo.WinForms.Services;

/// <summary>
/// Thin wrapper around HttpClient for talking to LoginDemo.Api. This is a
/// desktop app, not a browser, so CORS never applies here - it's just a
/// plain outbound HTTP call straight to the API's login and students
/// endpoints.
/// </summary>
public class ApiClient
{
    // Must match the "http" profile's applicationUrl in
    // LoginDemo.Api/Properties/launchSettings.json.
    private const string BaseUrl = "http://localhost:5299/";

    private readonly HttpClient _httpClient;

    public ApiClient()
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(BaseUrl)
        };
    }

    /// <summary>
    /// Calls POST api/auth/login. Returns a tuple instead of throwing on a
    /// bad-credentials/network failure so LoginForm can just show
    /// result.Error in the status label without a try/catch of its own.
    /// </summary>
    public async Task<(bool Success, string? Token, string? FullName, string? Error)> LoginAsync(string username, string password)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/auth/login", new
            {
                Username = username,
                Password = password
            });

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                return (false, null, null, string.IsNullOrWhiteSpace(body) ? "Invalid username or password." : body);
            }

            var result = await response.Content.ReadFromJsonAsync<LoginResult>();
            if (result is null)
            {
                return (false, null, null, "Unexpected empty response from the API.");
            }

            return (true, result.Token, result.FullName, null);
        }
        catch (Exception ex)
        {
            return (false, null, null, $"Could not reach the API: {ex.Message}");
        }
    }

    public async Task<List<StudentDto>> GetStudentsAsync(string token)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var students = await _httpClient.GetFromJsonAsync<List<StudentDto>>("api/students");
        return students ?? new List<StudentDto>();
    }

    private class LoginResult
    {
        public string Token { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
