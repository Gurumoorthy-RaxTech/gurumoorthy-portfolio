namespace EmployeeDeptApi.WinForms.Services
{
    // A desktop app has no HTTP Session to lean on. Registered as a DI Singleton
    // (one instance for the whole process), this plays the same role the web app's
    // Session played: holding the JWT + username between LoginForm and DashboardForm.
    public class SessionState
    {
        public string? Token { get; set; }
        public string? Username { get; set; }

        public bool IsAuthenticated => !string.IsNullOrEmpty(Token);

        public void Clear()
        {
            Token = null;
            Username = null;
        }
    }
}
