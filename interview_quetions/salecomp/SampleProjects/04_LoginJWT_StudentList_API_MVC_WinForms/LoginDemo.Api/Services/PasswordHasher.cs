using System.Security.Cryptography;
using System.Text;

namespace LoginDemo.Api.Services;

/// <summary>
/// DEMO-grade password hashing: plain SHA256 over the UTF-8 password bytes,
/// lowercase hex-encoded, no per-user salt. This is fine for a fast
/// interview demo where the point is "wire up hashing + compare it end to
/// end", but a real production system should use BCrypt or Argon2 with a
/// per-user salt instead - say so out loud if asked about it in an
/// interview, since naming the tradeoff yourself is itself a good signal.
/// </summary>
public static class PasswordHasher
{
    public static string Hash(string plainTextPassword)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainTextPassword));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
