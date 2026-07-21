using LoginDemo.WinForms.Services;

namespace LoginDemo.WinForms;

public partial class StudentListForm : Form
{
    private readonly ApiClient _apiClient = new();

    public StudentListForm()
    {
        InitializeComponent();

        this.Load += async (_, _) => await LoadStudentsAsync();
        btnLogout.Click += (_, _) => this.Close();
    }

    /// <summary>
    /// Calls GET api/students with the token LoginForm stashed after a
    /// successful login, and binds the result straight to the grid.
    /// </summary>
    private async Task LoadStudentsAsync()
    {
        if (string.IsNullOrEmpty(LoginForm.CurrentToken))
        {
            MessageBox.Show(this, "Not logged in.", "LoginDemo", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            this.Close();
            return;
        }

        lblStatus.Text = "Loading students...";
        try
        {
            var students = await _apiClient.GetStudentsAsync(LoginForm.CurrentToken);
            dgvStudents.DataSource = students;
            lblStatus.Text = $"Loaded {students.Count} student(s). Signed in as {LoginForm.CurrentFullName}.";
        }
        catch (Exception ex)
        {
            // Don't let a network hiccup (e.g. API not running, or a
            // rejected/expired token) crash the app - show it and let the
            // user Logout and try again.
            lblStatus.Text = $"Error loading students: {ex.Message}";
        }
    }
}
