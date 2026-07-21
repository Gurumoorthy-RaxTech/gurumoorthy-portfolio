using System;
using System.Collections.Generic;
using System.Windows.Forms;
using SchoolApp.DataAccess;
using SchoolApp.Models;

namespace SchoolApp
{
    public partial class Form1 : Form
    {
        private readonly StudentRepository _repository = new StudentRepository();
        private int _selectedId = 0;   // 0 = nothing selected yet

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            LoadGrid(_repository.GetAll());
        }

        private void LoadGrid(List<Student> students)
        {
            // Rebinding DataSource to null first forces the grid to fully refresh
            // instead of trying to diff against the old list.
            dgvStudents.DataSource = null;
            dgvStudents.DataSource = students;
        }

        private void btnAdd_Click(object sender, EventArgs e)
        {
            if (!ValidateInputs()) return;

            var student = new Student
            {
                Name = txtName.Text.Trim(),
                ClassName = txtClass.Text.Trim(),
                Age = int.Parse(txtAge.Text),
                Email = txtEmail.Text.Trim()
            };

            try
            {
                _repository.Insert(student);
                MessageBox.Show("Student added successfully.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                ClearInputs();
                LoadGrid(_repository.GetAll());
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not add student: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void btnUpdate_Click(object sender, EventArgs e)
        {
            if (_selectedId == 0)
            {
                MessageBox.Show("Select a student from the grid first.", "Info", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            if (!ValidateInputs()) return;

            var student = new Student
            {
                Id = _selectedId,
                Name = txtName.Text.Trim(),
                ClassName = txtClass.Text.Trim(),
                Age = int.Parse(txtAge.Text),
                Email = txtEmail.Text.Trim()
            };

            try
            {
                _repository.Update(student);
                MessageBox.Show("Student updated successfully.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                ClearInputs();
                LoadGrid(_repository.GetAll());
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not update student: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void btnDelete_Click(object sender, EventArgs e)
        {
            if (_selectedId == 0)
            {
                MessageBox.Show("Select a student from the grid first.", "Info", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            var confirm = MessageBox.Show("Delete this student?", "Confirm", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (confirm != DialogResult.Yes) return;

            try
            {
                _repository.Delete(_selectedId);
                MessageBox.Show("Student deleted.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                ClearInputs();
                LoadGrid(_repository.GetAll());
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not delete student: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void btnClear_Click(object sender, EventArgs e)
        {
            ClearInputs();
        }

        private void btnSearch_Click(object sender, EventArgs e)
        {
            LoadGrid(_repository.Search(txtSearch.Text.Trim()));
        }

        private void txtSearch_TextChanged(object sender, EventArgs e)
        {
            LoadGrid(_repository.Search(txtSearch.Text.Trim()));
        }

        private void btnRefresh_Click(object sender, EventArgs e)
        {
            txtSearch.Text = "";
            ClearInputs();
            LoadGrid(_repository.GetAll());
        }

        private void dgvStudents_SelectionChanged(object sender, EventArgs e)
        {
            if (dgvStudents.CurrentRow == null || dgvStudents.CurrentRow.DataBoundItem == null) return;

            var student = (Student)dgvStudents.CurrentRow.DataBoundItem;
            _selectedId = student.Id;
            txtName.Text = student.Name;
            txtClass.Text = student.ClassName;
            txtAge.Text = student.Age.ToString();
            txtEmail.Text = student.Email;
        }

        private void txtAge_KeyPress(object sender, KeyPressEventArgs e)
        {
            // Block anything that isn't a digit or a control key (Backspace, Delete, etc.)
            if (!char.IsDigit(e.KeyChar) && !char.IsControl(e.KeyChar))
                e.Handled = true;
        }

        private bool ValidateInputs()
        {
            if (string.IsNullOrWhiteSpace(txtName.Text))
            {
                MessageBox.Show("Name is required.", "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            if (!int.TryParse(txtAge.Text, out int age) || age <= 0 || age > 100)
            {
                MessageBox.Show("Enter a valid age (1-100).", "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            return true;
        }

        private void ClearInputs()
        {
            _selectedId = 0;
            txtName.Clear();
            txtClass.Clear();
            txtAge.Clear();
            txtEmail.Clear();
        }
    }
}
