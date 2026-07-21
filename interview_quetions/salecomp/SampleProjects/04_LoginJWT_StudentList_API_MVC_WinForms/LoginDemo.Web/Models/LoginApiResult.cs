namespace LoginDemo.Web.Models;

/// <summary>Local mirror of the API's POST api/auth/login response shape.</summary>
public class LoginApiResult
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
