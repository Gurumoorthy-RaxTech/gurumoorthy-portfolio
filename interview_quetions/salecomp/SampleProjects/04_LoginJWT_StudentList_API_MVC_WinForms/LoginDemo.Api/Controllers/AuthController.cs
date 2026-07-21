using LoginDemo.Api.Models.Dtos;
using LoginDemo.Api.Repositories;
using LoginDemo.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LoginDemo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(IUserRepository userRepository, JwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Looks up the user by Username, hashes the incoming password with the
    /// same DEMO-grade SHA256 scheme the seed script's hash was computed
    /// with (see PasswordHasher), and compares it to the stored hash. On a
    /// match, issues a JWT that both client UIs then send back as a Bearer
    /// token on GET api/students.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user is null)
        {
            return Unauthorized("Invalid username or password.");
        }

        var incomingHash = PasswordHasher.Hash(request.Password);
        if (!string.Equals(incomingHash, user.PasswordHash, StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized("Invalid username or password.");
        }

        var token = _jwtTokenService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            FullName = user.FullName
        });
    }
}
