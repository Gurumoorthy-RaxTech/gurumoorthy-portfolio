namespace UnitBarcodeScanner.WinFormsScanner;

partial class Form1
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

    private System.Windows.Forms.Label lblOperatorName = null!;
    private System.Windows.Forms.TextBox txtOperatorName = null!;
    private System.Windows.Forms.Label lblBarcode = null!;
    private System.Windows.Forms.TextBox txtBarcode = null!;
    private System.Windows.Forms.Button btnRefreshHistory = null!;
    private System.Windows.Forms.DataGridView dgvHistory = null!;
    private System.Windows.Forms.Label lblStatus = null!;
    private System.Windows.Forms.Panel pnlTop = null!;

    /// <summary>
    ///  Required method for Designer support - do not modify
    ///  the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        this.components = new System.ComponentModel.Container();
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.ClientSize = new System.Drawing.Size(760, 520);
        this.Text = "Unit Barcode Scanner";
        this.MinimumSize = new System.Drawing.Size(600, 400);

        // --- Top panel: operator name, barcode, refresh button ---
        pnlTop = new System.Windows.Forms.Panel
        {
            Dock = System.Windows.Forms.DockStyle.Top,
            Height = 110,
            Padding = new System.Windows.Forms.Padding(10)
        };

        lblOperatorName = new System.Windows.Forms.Label
        {
            Text = "Operator Name:",
            Location = new System.Drawing.Point(10, 15),
            AutoSize = true
        };

        txtOperatorName = new System.Windows.Forms.TextBox
        {
            Location = new System.Drawing.Point(140, 12),
            Width = 250
        };

        lblBarcode = new System.Windows.Forms.Label
        {
            Text = "Barcode (scan here):",
            Location = new System.Drawing.Point(10, 50),
            AutoSize = true
        };

        txtBarcode = new System.Windows.Forms.TextBox
        {
            Location = new System.Drawing.Point(140, 47),
            Width = 250
        };

        btnRefreshHistory = new System.Windows.Forms.Button
        {
            Text = "Refresh History",
            Location = new System.Drawing.Point(410, 12),
            Width = 140,
            Height = 30
        };

        pnlTop.Controls.Add(lblOperatorName);
        pnlTop.Controls.Add(txtOperatorName);
        pnlTop.Controls.Add(lblBarcode);
        pnlTop.Controls.Add(txtBarcode);
        pnlTop.Controls.Add(btnRefreshHistory);

        // --- Status label at the bottom ---
        lblStatus = new System.Windows.Forms.Label
        {
            Dock = System.Windows.Forms.DockStyle.Bottom,
            Height = 30,
            TextAlign = System.Drawing.ContentAlignment.MiddleLeft,
            Padding = new System.Windows.Forms.Padding(10, 0, 0, 0),
            Text = "Ready. Type/scan a barcode and press Enter."
        };

        // --- Grid fills the remaining space ---
        dgvHistory = new System.Windows.Forms.DataGridView
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

        this.Controls.Add(dgvHistory);
        this.Controls.Add(lblStatus);
        this.Controls.Add(pnlTop);
    }

    #endregion
}
