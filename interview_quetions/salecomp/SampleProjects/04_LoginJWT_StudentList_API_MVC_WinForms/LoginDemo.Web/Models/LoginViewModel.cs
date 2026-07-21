using System.ComponentModel.DataAnnotations;

namespace LoginDemo.Web.Models;

public class LoginViewModel
{
    [Required]
    [Display(Name = "Username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string Password { get; set; } = string.Empty;

    /// <summary>Set by AccountController when the API rejects the login.</summary>
    public string? ErrorMessage { get; set; }
}
