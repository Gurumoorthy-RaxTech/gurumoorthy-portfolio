using LoginDemo.WinForms.Services;

namespace LoginDemo.WinForms;

public partial class LoginForm : Form
{
    private readonly ApiClient _apiClient = new();

    /// <summary>
    /// Shared across the app for the lifetime of the process - StudentListForm
    /// reads this to authenticate its GET api/students call. A plain static
    /// field is a deliberate, pragmatic choice for a small two-form demo;
    /// a bigger app would use DI/a proper session service instead.
    /// </summary>
    public static string? CurrentToken { get; set; }
    public static string? CurrentFullName { get; set; }

    public LoginForm()
    {
        InitializeComponent();

        btnLogin.Click += async (_, _) => await LoginAsync();

        // Let Enter in the password box submit the form, same idea as a
        // real login page.
        txtPassword.KeyDown += (_, e) =>
        {
            if (e.KeyCode == Keys.Enter)
            {
                e.SuppressKeyPress = true;
                btnLogin.PerformClick();
            }
        };
    }

    private async Task LoginAsync()
    {
        var username = txtUsername.Text.Trim();
        var password = txtPassword.Text;

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            lblStatus.Text = "Enter both username and password.";
            return;
        }

        btnLogin.Enabled = false;
        lblStatus.Text = "Signing in...";

        var (success, token, fullName, error) = await _apiClient.LoginAsync(username, password);

        btnLogin.Enabled = true;

        if (!success || token is null)
        {
            lblStatus.Text = error ?? "Login failed.";
            return;
        }

        CurrentToken = token;
        CurrentFullName = fullName;

        this.Hide();

        var studentListForm = new StudentListForm();
        studentListForm.FormClosed += (_, _) =>
        {
            // Whether the user clicked Logout or just closed the window,
            // come back to the login screen instead of leaving the app with
            // no visible window - LoginForm is still the "main form"
            // Application.Run was started with, so it's what keeps the
            // message loop (and the process) alive.
            CurrentToken = null;
            CurrentFullName = null;
            txtPassword.Text = string.Empty;
            lblStatus.Text = "Demo credentials: admin / Admin@123";
            this.Show();
        };
        studentListForm.Show();
    }
}
