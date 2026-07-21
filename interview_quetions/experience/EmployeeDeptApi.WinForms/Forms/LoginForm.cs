using EmployeeDeptApi.WinForms.Services;

namespace EmployeeDeptApi.WinForms.Forms
{
    // UI built by hand in InitializeComponent (no Visual Studio designer file) -
    // keeps everything in one readable file for a project this small.
    public class LoginForm : Form
    {
        private readonly IEmployeeApiClient _apiClient;
        private readonly SessionState _session;

        private TextBox _txtUsername = null!;
        private TextBox _txtPassword = null!;
        private Button _btnLogin = null!;
        private Label _lblError = null!;
        private Label _lblHint = null!;

        // Constructor injection - LoginForm depends on IEmployeeApiClient (abstraction)
        // and the shared SessionState singleton, both resolved by the DI container
        // set up in Program.cs. Same pattern as every ASP.NET Core class in the other
        // three projects; DI isn't an ASP.NET Core-only thing.
        public LoginForm(IEmployeeApiClient apiClient, SessionState session)
        {
            _apiClient = apiClient;
            _session = session;
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            Text = "Employee Dept Portal - Login";
            ClientSize = new Size(360, 260);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            StartPosition = FormStartPosition.CenterScreen;
            MaximizeBox = false;
            MinimizeBox = false;

            var lblTitle = new Label
            {
                Text = "Employee Dept Portal",
                Font = new Font("Segoe UI", 14, FontStyle.Bold),
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 20),
                Size = new Size(320, 30)
            };

            var lblUsername = new Label { Text = "Username", Location = new Point(20, 70), Size = new Size(320, 20) };
            _txtUsername = new TextBox { Location = new Point(20, 92), Size = new Size(320, 24) };

            var lblPassword = new Label { Text = "Password", Location = new Point(20, 124), Size = new Size(320, 20) };
            _txtPassword = new TextBox { Location = new Point(20, 146), Size = new Size(320, 24), UseSystemPasswordChar = true };

            _lblError = new Label
            {
                Text = string.Empty,
                ForeColor = Color.Firebrick,
                Location = new Point(20, 176),
                Size = new Size(320, 20)
            };

            _btnLogin = new Button
            {
                Text = "Login",
                Location = new Point(20, 200),
                Size = new Size(320, 32),
                DialogResult = DialogResult.None
            };
            _btnLogin.Click += BtnLogin_Click;

            _lblHint = new Label
            {
                Text = "Demo credentials: admin / admin123",
                ForeColor = Color.Gray,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 236),
                Size = new Size(320, 18)
            };

            Controls.AddRange(new Control[] { lblTitle, lblUsername, _txtUsername, lblPassword, _txtPassword, _lblError, _btnLogin, _lblHint });

            AcceptButton = _btnLogin;
        }

        private async void BtnLogin_Click(object? sender, EventArgs e)
        {
            _lblError.Text = string.Empty;

            var username = _txtUsername.Text.Trim();
            var password = _txtPassword.Text;

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _lblError.Text = "Username and password are required.";
                return;
            }

            _btnLogin.Enabled = false;
            _btnLogin.Text = "Signing in...";

            var (success, result, error) = await _apiClient.LoginAsync(username, password);

            _btnLogin.Enabled = true;
            _btnLogin.Text = "Login";

            if (!success || result is null)
            {
                _lblError.Text = error ?? "Login failed. Please try again.";
                return;
            }

            _session.Token = result.Token;
            _session.Username = username;

            // Signal success to Program.cs, which is waiting on ShowDialog()'s return value.
            DialogResult = DialogResult.OK;
            Close();
        }
    }
}
