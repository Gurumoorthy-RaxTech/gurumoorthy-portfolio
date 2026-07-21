using EmployeeDeptApi.Auth;
using EmployeeDeptApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace EmployeeDeptApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly JwtSettings _jwtSettings;

        // Constructor Injection: ASP.NET Core's built-in DI container resolves
        // ITokenService and JwtSettings automatically (registered in Program.cs).
        public AuthController(ITokenService tokenService, IOptions<JwtSettings> jwtSettings)
        {
            _tokenService = tokenService;
            _jwtSettings = jwtSettings.Value;
        }

        // Demo login: hardcoded credentials for interview purposes.
        // In a real app this would validate against a Users table with hashed passwords.
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login(LoginRequestDto request)
        {
            if (request.Username != "admin" || request.Password != "admin123")
                return Unauthorized(new { message = "Invalid username or password." });

            var token = _tokenService.GenerateToken(request.Username, "Admin");

            return Ok(new LoginResponseDto
            {
                Token = token,
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes)
            });
        }
    }
}
