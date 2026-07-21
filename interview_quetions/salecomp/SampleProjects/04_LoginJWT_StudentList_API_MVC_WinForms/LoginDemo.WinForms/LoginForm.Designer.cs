namespace LoginDemo.WinForms;

partial class LoginForm
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

    private System.Windows.Forms.Label lblTitle = null!;
    private System.Windows.Forms.Label lblUsername = null!;
    private System.Windows.Forms.TextBox txtUsername = null!;
    private System.Windows.Forms.Label lblPassword = null!;
    private System.Windows.Forms.TextBox txtPassword = null!;
    private System.Windows.Forms.Button btnLogin = null!;
    private System.Windows.Forms.Label lblStatus = null!;

    /// <summary>
    ///  Required method for Designer support - do not modify
    ///  the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        this.components = new System.ComponentModel.Container();
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.ClientSize = new System.Drawing.Size(360, 260);
        this.Text = "LoginDemo - Login";
        this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;

        lblTitle = new System.Windows.Forms.Label
        {
            Text = "LoginDemo",
            Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold),
            Location = new System.Drawing.Point(20, 20),
            AutoSize = true
        };

        lblUsername = new System.Windows.Forms.Label
        {
            Text = "Username:",
            Location = new System.Drawing.Point(20, 70),
            AutoSize = true
        };

        txtUsername = new System.Windows.Forms.TextBox
        {
            Location = new System.Drawing.Point(120, 67),
            Width = 200
        };

        lblPassword = new System.Windows.Forms.Label
        {
            Text = "Password:",
            Location = new System.Drawing.Point(20, 105),
            AutoSize = true
        };

        txtPassword = new System.Windows.Forms.TextBox
        {
            Location = new System.Drawing.Point(120, 102),
            Width = 200,
            UseSystemPasswordChar = true
        };

        btnLogin = new System.Windows.Forms.Button
        {
            Text = "Login",
            Location = new System.Drawing.Point(120, 145),
            Width = 100,
            Height = 32
        };

        lblStatus = new System.Windows.Forms.Label
        {
            Text = "Demo credentials: admin / Admin@123",
            Location = new System.Drawing.Point(20, 195),
            Size = new System.Drawing.Size(320, 40),
            ForeColor = System.Drawing.Color.DimGray
        };

        this.Controls.Add(lblTitle);
        this.Controls.Add(lblUsername);
        this.Controls.Add(txtUsername);
        this.Controls.Add(lblPassword);
        this.Controls.Add(txtPassword);
        this.Controls.Add(btnLogin);
        this.Controls.Add(lblStatus);
    }

    #endregion
}
