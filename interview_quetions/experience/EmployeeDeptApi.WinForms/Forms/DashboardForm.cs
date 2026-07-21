using EmployeeDeptApi.WinForms.Models;
using EmployeeDeptApi.WinForms.Services;

namespace EmployeeDeptApi.WinForms.Forms
{
    public class DashboardForm : Form
    {
        private readonly IEmployeeApiClient _apiClient;
        private readonly SessionState _session;

        private Label _lblWelcome = null!;
        private Label _lblEmployeeCount = null!;
        private Label _lblDepartmentCount = null!;
        private Label _lblTotalPayroll = null!;
        private DataGridView _gridEmployees = null!;
        private ListBox _lstDepartments = null!;
        private Button _btnRefresh = null!;
        private Button _btnAddEmployee = null!;
        private Button _btnDeleteEmployee = null!;
        private Button _btnLogout = null!;

        private List<DepartmentApiModel> _departments = new();

        // True only when the user explicitly clicks Logout, as opposed to closing the
        // window with the titlebar X. Program.cs uses this to decide whether to loop
        // back to LoginForm or exit the application entirely.
        public bool LoggedOut { get; private set; }

        public DashboardForm(IEmployeeApiClient apiClient, SessionState session)
        {
            _apiClient = apiClient;
            _session = session;
            InitializeComponent();
            Load += DashboardForm_Load;
        }

        private void InitializeComponent()
        {
            Text = "Employee Dept Portal - Dashboard";
            ClientSize = new Size(900, 560);
            StartPosition = FormStartPosition.CenterScreen;
            MinimumSize = new Size(820, 480);

            _lblWelcome = new Label
            {
                Text = "Signed in as: ",
                Location = new Point(20, 16),
                Size = new Size(400, 24),
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };

            _btnLogout = new Button { Text = "Logout", Location = new Point(800, 14), Size = new Size(80, 28), Anchor = AnchorStyles.Top | AnchorStyles.Right };
            _btnLogout.Click += BtnLogout_Click;

            // Summary cards
            _lblEmployeeCount = CreateCard("Total Employees", new Point(20, 50));
            _lblDepartmentCount = CreateCard("Total Departments", new Point(320, 50));
            _lblTotalPayroll = CreateCard("Total Monthly Salary", new Point(620, 50));
            Controls.Add((Panel)_lblEmployeeCount.Tag!);
            Controls.Add((Panel)_lblDepartmentCount.Tag!);
            Controls.Add((Panel)_lblTotalPayroll.Tag!);

            // Employee grid
            _gridEmployees = new DataGridView
            {
                Location = new Point(20, 140),
                Size = new Size(560, 360),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                ReadOnly = true,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                MultiSelect = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                RowHeadersVisible = false
            };

            _btnRefresh = new Button { Text = "Refresh", Location = new Point(20, 108), Size = new Size(90, 26) };
            _btnRefresh.Click += async (s, e) => await LoadDataAsync();

            _btnAddEmployee = new Button { Text = "Add Employee", Location = new Point(120, 108), Size = new Size(110, 26) };
            _btnAddEmployee.Click += BtnAddEmployee_Click;

            _btnDeleteEmployee = new Button { Text = "Delete Selected", Location = new Point(240, 108), Size = new Size(120, 26) };
            _btnDeleteEmployee.Click += BtnDeleteEmployee_Click;

            var lblDeptHeader = new Label
            {
                Text = "Departments",
                Location = new Point(600, 108),
                Size = new Size(280, 24),
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Anchor = AnchorStyles.Top | AnchorStyles.Right
            };

            _lstDepartments = new ListBox
            {
                Location = new Point(600, 140),
                Size = new Size(280, 360),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Right
            };

            Controls.AddRange(new Control[]
            {
                _lblWelcome, _btnLogout,
                _btnRefresh, _btnAddEmployee, _btnDeleteEmployee,
                _gridEmployees, lblDeptHeader, _lstDepartments
            });
        }

        // Returns the value label; the label is nested inside a bordered Panel
        // (added to Controls separately, right after this call returns) so the
        // "summary card" reads as one bordered block instead of two floating labels.
        private static Label CreateCard(string title, Point location)
        {
            var panel = new Panel
            {
                Location = location,
                Size = new Size(280, 44),
                BorderStyle = BorderStyle.FixedSingle
            };

            var lblTitle = new Label { Text = title, Dock = DockStyle.Top, TextAlign = ContentAlignment.MiddleLeft, Padding = new Padding(8, 2, 0, 0) };
            var lblValue = new Label { Text = "0", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft, Padding = new Padding(8, 0, 0, 4), Font = new Font("Segoe UI", 12, FontStyle.Bold) };

            panel.Controls.Add(lblValue);
            panel.Controls.Add(lblTitle);

            // Stash the panel on the label's Tag so Controls.AddRange (which expects
            // Control, not Label+Panel) still works below - we add the panel itself.
            lblValue.Tag = panel;
            return lblValue;
        }

        private async void DashboardForm_Load(object? sender, EventArgs e)
        {
            _lblWelcome.Text = $"Signed in as: {_session.Username}";
            await LoadDataAsync();
        }

        private async Task LoadDataAsync()
        {
            if (string.IsNullOrEmpty(_session.Token))
                return;

            try
            {
                _btnRefresh.Enabled = false;

                var employees = await _apiClient.GetEmployeesAsync(_session.Token);
                _departments = (await _apiClient.GetDepartmentsAsync(_session.Token)).ToList();

                _gridEmployees.DataSource = employees.Select(emp => new
                {
                    emp.EmployeeId,
                    Name = $"{emp.FirstName} {emp.LastName}".Trim(),
                    emp.Email,
                    Department = emp.DepartmentName,
                    Salary = emp.Salary.ToString("C0")
                }).ToList();

                _lstDepartments.DataSource = null;
                _lstDepartments.DisplayMember = nameof(DepartmentApiModel.Name);
                _lstDepartments.DataSource = _departments;

                _lblEmployeeCount.Text = employees.Count.ToString();
                _lblDepartmentCount.Text = _departments.Count.ToString();
                _lblTotalPayroll.Text = employees.Sum(emp => emp.Salary).ToString("C0");
            }
            catch (HttpRequestException)
            {
                // Most likely the JWT expired or was rejected - the session is no
                // longer valid, so send the user back to Login.
                MessageBox.Show(this, "Your session has expired. Please log in again.", "Session Expired",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                _session.Clear();
                LoggedOut = true;
                Close();
            }
            finally
            {
                _btnRefresh.Enabled = true;
            }
        }

        private async void BtnAddEmployee_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(_session.Token)) return;

            using var addForm = new AddEmployeeForm(_apiClient, _session.Token, _departments);
            if (addForm.ShowDialog(this) == DialogResult.OK)
            {
                await LoadDataAsync();
            }
        }

        private async void BtnDeleteEmployee_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(_session.Token)) return;

            if (_gridEmployees.CurrentRow?.DataBoundItem is null)
            {
                MessageBox.Show(this, "Select an employee row first.", "No selection", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var row = _gridEmployees.CurrentRow;
            var employeeId = Convert.ToInt32(row.Cells["EmployeeId"].Value);
            var name = row.Cells["Name"].Value?.ToString();

            var confirm = MessageBox.Show(this, $"Delete employee '{name}'?", "Confirm delete",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (confirm != DialogResult.Yes) return;

            var (success, error) = await _apiClient.DeleteEmployeeAsync(_session.Token, employeeId);
            if (!success)
            {
                MessageBox.Show(this, error ?? "Failed to delete employee.", "Delete failed",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            await LoadDataAsync();
        }

        private void BtnLogout_Click(object? sender, EventArgs e)
        {
            _session.Clear();
            LoggedOut = true;
            Close();
        }
    }
}
