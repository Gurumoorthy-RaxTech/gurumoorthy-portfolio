namespace LoginDemo.Api.Models.Dtos;

/// <summary>Response of POST api/auth/login on success.</summary>
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
