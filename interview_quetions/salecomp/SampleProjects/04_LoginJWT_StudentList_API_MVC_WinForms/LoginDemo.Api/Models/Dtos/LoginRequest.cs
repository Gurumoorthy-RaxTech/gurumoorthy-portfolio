namespace LoginDemo.Api.Models.Dtos;

/// <summary>Body of POST api/auth/login.</summary>
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
