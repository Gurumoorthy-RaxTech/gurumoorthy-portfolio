using System.Net.Http.Headers;
using System.Net.Http.Json;
using EmployeeDeptApi.WinForms.Models;

namespace EmployeeDeptApi.WinForms.Services
{
    // Registered as a typed HttpClient in Program.cs (AddHttpClient<IEmployeeApiClient, EmployeeApiClient>).
    // Even in a desktop app, the same "don't `new HttpClient()` yourself" rule applies -
    // IHttpClientFactory manages pooling regardless of whether the host is ASP.NET Core
    // or, as here, a Generic Host wrapping a WinForms app.
    public class EmployeeApiClient : IEmployeeApiClient
    {
        private readonly HttpClient _httpClient;

        public EmployeeApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(bool Success, LoginResponse? Result, string? Error)> LoginAsync(string username, string password)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/auth/login", new { username, password });

                if (!response.IsSuccessStatusCode)
                {
                    var error = await TryReadErrorAsync(response);
                    return (false, null, error ?? "Invalid username or password.");
                }

                var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
                return (true, result, null);
            }
            catch (HttpRequestException ex)
            {
                return (false, null, $"Could not reach the API: {ex.Message}");
            }
        }

        public async Task<IReadOnlyList<DepartmentApiModel>> GetDepartmentsAsync(string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "api/departments");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<DepartmentApiModel>>() ?? new List<DepartmentApiModel>();
        }

        public async Task<IReadOnlyList<EmployeeApiModel>> GetEmployeesAsync(string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "api/employees");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<EmployeeApiModel>>() ?? new List<EmployeeApiModel>();
        }

        public async Task<(bool Success, string? Error)> CreateEmployeeAsync(string token, EmployeeCreateModel employee)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "api/employees")
            {
                Content = JsonContent.Create(employee)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
                return (true, null);

            var error = await TryReadErrorAsync(response);
            return (false, error ?? $"Request failed with status {(int)response.StatusCode}.");
        }

        public async Task<(bool Success, string? Error)> DeleteEmployeeAsync(string token, int employeeId)
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, $"api/employees/{employeeId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
                return (true, null);

            var error = await TryReadErrorAsync(response);
            return (false, error ?? $"Request failed with status {(int)response.StatusCode}.");
        }

        private static async Task<string?> TryReadErrorAsync(HttpResponseMessage response)
        {
            try
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>();
                return error?.Message;
            }
            catch
            {
                return null;
            }
        }
    }
}
