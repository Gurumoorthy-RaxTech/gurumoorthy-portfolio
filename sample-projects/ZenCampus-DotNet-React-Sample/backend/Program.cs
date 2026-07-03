using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// ---------- Services (dependency injection container setup) ----------

// Controllers give us [ApiController]-style routing (Controllers/StudentsController.cs).
builder.Services.AddControllers();

// Swagger/OpenAPI: generates the interactive docs UI at /swagger.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core + SQLite: one file-based DB (zencampus.db), zero external DB server needed
// to run this sample. Swap UseSqlite(...) for UseSqlServer(...) to point at a real
// SQL Server instance without touching any controller/model code.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=zencampus.db"));

// CORS: the React dev server (Vite, http://localhost:5173) runs on a different
// origin than this API (http://localhost:5041), so the browser blocks the request
// unless the API explicitly allows it via a CORS policy.
const string ReactAppPolicy = "ReactAppPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactAppPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ---------- Startup: ensure the SQLite DB file + seed data exist ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// ---------- HTTP request pipeline (middleware, in order) ----------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // browse to /swagger to try every endpoint interactively
}

app.UseHttpsRedirection();

app.UseCors(ReactAppPolicy); // must run before MapControllers so it applies to API routes

app.UseAuthorization();

app.MapControllers();

app.Run();
