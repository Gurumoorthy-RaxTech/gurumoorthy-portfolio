using EmployeeDeptApi.WinForms.Forms;
using EmployeeDeptApi.WinForms.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace EmployeeDeptApi.WinForms;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        // Generic Host gives a WinForms app the same DI container + configuration
        // system ASP.NET Core apps use - Host.CreateApplicationBuilder() picks up
        // appsettings.json from the output directory automatically.
        var builder = Host.CreateApplicationBuilder();

        var apiBaseUrl = builder.Configuration["ApiBaseUrl"] ?? "http://localhost:5199";

        builder.Services.AddHttpClient<IEmployeeApiClient, EmployeeApiClient>(client =>
        {
            client.BaseAddress = new Uri(apiBaseUrl);
        });

        // Singleton: one SessionState for the whole app's lifetime (holds the JWT).
        builder.Services.AddSingleton<SessionState>();

        // Transient: a fresh Form instance every time one is requested - required
        // here since the login/dashboard loop below asks for a new one each pass
        // and disposes the previous instance (`using`).
        builder.Services.AddTransient<LoginForm>();
        builder.Services.AddTransient<DashboardForm>();

        using var host = builder.Build();
        var services = host.Services;

        // Login -> Dashboard -> Logout loops back to Login. Closing either window
        // via the titlebar X (without explicitly logging out) exits the app.
        while (true)
        {
            using var loginForm = services.GetRequiredService<LoginForm>();
            if (loginForm.ShowDialog() != DialogResult.OK)
                break;

            using var dashboardForm = services.GetRequiredService<DashboardForm>();
            Application.Run(dashboardForm);

            if (!dashboardForm.LoggedOut)
                break;
        }
    }
}
