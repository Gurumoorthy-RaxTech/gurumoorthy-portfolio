namespace LoginDemo.WinForms;

partial class StudentListForm
{
    /// <summary>
    ///  Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    ///  Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    // This project was scaffolded via the dotnet CLI (not Visual Studio), so
    // there is no .resx-backed designer surface. All controls are built by
    // hand in code below - a fully valid, robust way to build a WinForms UI.

    private System.Windows.Forms.Panel pnlTop = null!;
    private System.Windows.Forms.Button btnLogout = null!;
    private System.Windows.Forms.DataGridView dgvStudents = null!;
    private System.Windows.Forms.Label lblStatus = null!;

    /// <summary>
    ///  Required method for Designer support - do not modify
    ///  the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        this.components = new System.ComponentModel.Container();
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.ClientSize = new System.Drawing.Size(640, 420);
        this.Text = "LoginDemo - Students";
        this.MinimumSize = new System.Drawing.Size(480, 320);
        this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;

        // --- Top panel: logout button ---
        pnlTop = new System.Windows.Forms.Panel
        {
            Dock = System.Windows.Forms.DockStyle.Top,
            Height = 50,
            Padding = new System.Windows.Forms.Padding(10)
        };

        btnLogout = new System.Windows.Forms.Button
        {
            Text = "Logout",
            Location = new System.Drawing.Point(10, 10),
            Width = 100,
            Height = 30
        };

        pnlTop.Controls.Add(btnLogout);

        // --- Status label at the bottom ---
        lblStatus = new System.Windows.Forms.Label
        {
            Dock = System.Windows.Forms.DockStyle.Bottom,
            Height = 30,
            TextAlign = System.Drawing.ContentAlignment.MiddleLeft,
            Padding = new System.Windows.Forms.Padding(10, 0, 0, 0),
            Text = "Loading..."
        };

        // --- Grid fills the remaining space ---
        dgvStudents = new System.Windows.Forms.DataGridView
        {
            Dock = System.Windows.Forms.DockStyle.Fill,
            ReadOnly = true,
            AllowUserToAddRows = false,
            AllowUserToDeleteRows = false,
            AllowUserToOrderColumns = false,
            AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill,
            SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect,
            MultiSelect = false
        };

        this.Controls.Add(dgvStudents);
        this.Controls.Add(lblStatus);
        this.Controls.Add(pnlTop);
    }

    #endregion
}
