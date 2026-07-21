using System.Net.Http.Headers;
using System.Net.Http.Json;
using EmployeeDeptApi.WebApp.Models;

namespace EmployeeDeptApi.WebApp.Services
{
    // Typed HttpClient (registered via AddHttpClient<IEmployeeApiClient, EmployeeApiClient>
    // in Program.cs). ASP.NET Core injects an HttpClient with BaseAddress already set
    // and manages the underlying socket/handler pooling for us - this is the recommended
    // way to call an external API instead of `new HttpClient()` per request.
    public class EmployeeApiClient : IEmployeeApiClient
    {
        private readonly HttpClient _httpClient;

        public EmployeeApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(bool Success, LoginResponse? Result, string? Error)> LoginAsync(string username, string password)
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
