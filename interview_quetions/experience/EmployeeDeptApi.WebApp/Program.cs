using EmployeeDeptApi.WebApp.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- 1. Razor Pages ----------
builder.Services.AddRazorPages();

// ---------- 2. Session (server-side storage for the JWT after login) ----------
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;   // JS can't read the session cookie
    options.Cookie.IsEssential = true;
});

// ---------- 3. Typed HttpClient for the EmployeeDeptApi ----------
// AddHttpClient<TInterface, TImplementation> both registers EmployeeApiClient for DI
// AND gives it a properly pooled HttpClient with BaseAddress pre-set - no manual
// `new HttpClient()` anywhere in the app.
builder.Services.AddHttpClient<IEmployeeApiClient, EmployeeApiClient>(client =>
{
    var apiBaseUrl = builder.Configuration["ApiBaseUrl"]
        ?? throw new InvalidOperationException("ApiBaseUrl is not configured.");
    client.BaseAddress = new Uri(apiBaseUrl);
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession();          // must come before UseAuthorization/MapRazorPages so pages can read it
app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
