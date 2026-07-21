using System.ComponentModel;
using UnitBarcodeScanner.WinFormsScanner.Models;
using UnitBarcodeScanner.WinFormsScanner.Services;

namespace UnitBarcodeScanner.WinFormsScanner;

public partial class Form1 : Form
{
    private readonly ApiClient _apiClient = new();
    private readonly BindingList<ScanRecord> _historyBinding = new();

    public Form1()
    {
        InitializeComponent();

        dgvHistory.DataSource = _historyBinding;

        // A physical barcode scanner behaves exactly like someone typing
        // very fast into a textbox and then pressing Enter, so wiring
        // KeyDown on the barcode textbox genuinely mimics real hardware -
        // no special scanner SDK/driver is needed for this to work.
        txtBarcode.KeyDown += TxtBarcode_KeyDown;
        btnRefreshHistory.Click += async (_, _) => await RefreshHistoryAsync();
        this.Load += async (_, _) => await RefreshHistoryAsync();
    }

    private async void TxtBarcode_KeyDown(object? sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Enter)
        {
            // Stop the "ding" beep Windows makes on Enter in a TextBox.
            e.SuppressKeyPress = true;

            await ScanAsync();

            txtBarcode.Clear();
            txtBarcode.Focus();
        }
    }

    private async Task ScanAsync()
    {
        var barcode = txtBarcode.Text.Trim();
        var operatorName = txtOperatorName.Text.Trim();

        if (string.IsNullOrEmpty(barcode))
        {
            lblStatus.Text = "Error: barcode is empty.";
            return;
        }

        if (string.IsNullOrEmpty(operatorName))
        {
            lblStatus.Text = "Error: enter an operator name before scanning.";
            return;
        }

        try
        {
            var success = await _apiClient.SaveUnitAsync(barcode, operatorName);
            if (success)
            {
                lblStatus.Text = "Saved!";
                await RefreshHistoryAsync();
            }
            else
            {
                lblStatus.Text = "Error: API returned a failure response.";
            }
        }
        catch (Exception ex)
        {
            // Don't let a network hiccup (e.g. API not running yet) crash
            // the scanner UI - just surface it in the status label.
            lblStatus.Text = $"Error: {ex.Message}";
        }
    }

    private async Task RefreshHistoryAsync()
    {
        try
        {
            var history = await _apiClient.GetHistoryAsync();

            _historyBinding.RaiseListChangedEvents = false;
            _historyBinding.Clear();
            foreach (var record in history)
            {
                _historyBinding.Add(record);
            }
            _historyBinding.RaiseListChangedEvents = true;
            _historyBinding.ResetBindings();
        }
        catch (Exception ex)
        {
            lblStatus.Text = $"Error loading history: {ex.Message}";
        }
    }
}
