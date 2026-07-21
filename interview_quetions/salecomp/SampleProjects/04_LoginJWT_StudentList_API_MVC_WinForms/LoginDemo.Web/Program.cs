var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Session holds the JWT + FullName between the login POST and later
// requests (Student/Index reads the token back out of it). Session-stored
// JWT is a simple, legitimate pattern for a "wire it up fast" demo -
// AddDistributedMemoryCache is the simplest in-process backing store, fine
// here even though a real multi-instance deployment would want something
// shared like Redis.
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
});

// Named HttpClient pointed at the Web API. The browser never talks to the
// API directly - only server-side AccountController/StudentController do,
// via IHttpClientFactory - so there's no CORS to configure anywhere.
builder.Services.AddHttpClient("LoginApi", c =>
{
    c.BaseAddress = new Uri(builder.Configuration["ApiBaseUrl"]!);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// UseSession must be registered after UseRouting and before
// UseAuthorization/MapControllerRoute so controller actions can read/write
// HttpContext.Session (AccountController.Login writes the token there,
// StudentController.Index reads it back out).
app.UseSession();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
