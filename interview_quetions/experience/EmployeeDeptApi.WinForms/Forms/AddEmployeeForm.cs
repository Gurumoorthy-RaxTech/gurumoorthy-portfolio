using EmployeeDeptApi.WinForms.Models;
using EmployeeDeptApi.WinForms.Services;

namespace EmployeeDeptApi.WinForms.Forms
{
    // Modal dialog: DashboardForm calls new AddEmployeeForm(...).ShowDialog() and
    // reloads the grid only if this returns DialogResult.OK.
    public class AddEmployeeForm : Form
    {
        private readonly IEmployeeApiClient _apiClient;
        private readonly string _token;

        private TextBox _txtFirstName = null!;
        private TextBox _txtLastName = null!;
        private TextBox _txtEmail = null!;
        private TextBox _txtPhone = null!;
        private NumericUpDown _numSalary = null!;
        private ComboBox _cmbDepartment = null!;
        private Label _lblError = null!;
        private Button _btnSave = null!;
        private Button _btnCancel = null!;

        public AddEmployeeForm(IEmployeeApiClient apiClient, string token, IReadOnlyList<DepartmentApiModel> departments)
        {
            _apiClient = apiClient;
            _token = token;
            InitializeComponent(departments);
        }

        private void InitializeComponent(IReadOnlyList<DepartmentApiModel> departments)
        {
            Text = "Add Employee";
            ClientSize = new Size(360, 340);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            StartPosition = FormStartPosition.CenterParent;
            MaximizeBox = false;
            MinimizeBox = false;

            var y = 20;
            const int rowHeight = 44;

            var lblFirst = new Label { Text = "First Name", Location = new Point(20, y), Size = new Size(320, 18) };
            _txtFirstName = new TextBox { Location = new Point(20, y + 20), Size = new Size(320, 24) };
            y += rowHeight;

            var lblLast = new Label { Text = "Last Name", Location = new Point(20, y), Size = new Size(320, 18) };
            _txtLastName = new TextBox { Location = new Point(20, y + 20), Size = new Size(320, 24) };
            y += rowHeight;

            var lblEmail = new Label { Text = "Email", Location = new Point(20, y), Size = new Size(320, 18) };
            _txtEmail = new TextBox { Location = new Point(20, y + 20), Size = new Size(320, 24) };
            y += rowHeight;

            var lblPhone = new Label { Text = "Phone", Location = new Point(20, y), Size = new Size(320, 18) };
            _txtPhone = new TextBox { Location = new Point(20, y + 20), Size = new Size(320, 24) };
            y += rowHeight;

            var lblSalary = new Label { Text = "Salary", Location = new Point(20, y), Size = new Size(150, 18) };
            _numSalary = new NumericUpDown
            {
                Location = new Point(20, y + 20),
                Size = new Size(150, 24),
                Maximum = 10_000_000,
                Minimum = 0,
                ThousandsSeparator = true
            };

            var lblDept = new Label { Text = "Department", Location = new Point(190, y), Size = new Size(150, 18) };
            _cmbDepartment = new ComboBox
            {
                Location = new Point(190, y + 20),
                Size = new Size(150, 24),
                DropDownStyle = ComboBoxStyle.DropDownList,
                DisplayMember = nameof(DepartmentApiModel.Name),
                ValueMember = nameof(DepartmentApiModel.DepartmentId)
            };
            _cmbDepartment.DataSource = departments.ToList();
            y += rowHeight;

            _lblError = new Label { Text = string.Empty, ForeColor = Color.Firebrick, Location = new Point(20, y), Size = new Size(320, 36) };
            y += 44;

            _btnSave = new Button { Text = "Save", Location = new Point(20, y), Size = new Size(150, 32) };
            _btnSave.Click += BtnSave_Click;

            _btnCancel = new Button { Text = "Cancel", Location = new Point(190, y), Size = new Size(150, 32), DialogResult = DialogResult.Cancel };

            Controls.AddRange(new Control[]
            {
                lblFirst, _txtFirstName, lblLast, _txtLastName, lblEmail, _txtEmail,
                lblPhone, _txtPhone, lblSalary, _numSalary, lblDept, _cmbDepartment,
                _lblError, _btnSave, _btnCancel
            });

            AcceptButton = _btnSave;
            CancelButton = _btnCancel;
        }

        private async void BtnSave_Click(object? sender, EventArgs e)
        {
            _lblError.Text = string.Empty;

            if (string.IsNullOrWhiteSpace(_txtFirstName.Text) || string.IsNullOrWhiteSpace(_txtEmail.Text))
            {
                _lblError.Text = "First name and email are required.";
                return;
            }

            if (_cmbDepartment.SelectedValue is not int departmentId)
            {
                _lblError.Text = "Please select a department.";
                return;
            }

            var employee = new EmployeeCreateModel
            {
                FirstName = _txtFirstName.Text.Trim(),
                LastName = string.IsNullOrWhiteSpace(_txtLastName.Text) ? null : _txtLastName.Text.Trim(),
                Email = _txtEmail.Text.Trim(),
                Phone = string.IsNullOrWhiteSpace(_txtPhone.Text) ? null : _txtPhone.Text.Trim(),
                Salary = _numSalary.Value,
                DepartmentId = departmentId
            };

            _btnSave.Enabled = false;
            var (success, error) = await _apiClient.CreateEmployeeAsync(_token, employee);
            _btnSave.Enabled = true;

            if (!success)
            {
                _lblError.Text = error ?? "Failed to create employee.";
                return;
            }

            DialogResult = DialogResult.OK;
            Close();
        }
    }
}
