using EmployeeDeptApi.DapperAdo.Data;
using EmployeeDeptApi.DapperAdo.Repositories.Ado;
using EmployeeDeptApi.DapperAdo.Repositories.Dapper;
using EmployeeDeptApi.DapperAdo.Repositories.Interfaces;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- 1. Shared connection factory ----------
// Both the Dapper repos and the ADO.NET repos depend on IDbConnectionFactory,
// not on SqlConnection/connection strings directly.
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

// ---------- 2. Keyed DI registrations (.NET 8+) ----------
// Two different classes implement the SAME interface. Keyed services let us
// register both side by side and ask for a specific one by key at injection time
// -- see the [FromKeyedServices("dapper"/"ado")] attributes in the controllers.
builder.Services.AddKeyedScoped<IDepartmentRepository, DapperDepartmentRepository>("dapper");
builder.Services.AddKeyedScoped<IDepartmentRepository, AdoDepartmentRepository>("ado");
builder.Services.AddKeyedScoped<IEmployeeRepository, DapperEmployeeRepository>("dapper");
builder.Services.AddKeyedScoped<IEmployeeRepository, AdoEmployeeRepository>("ado");

// ---------- 3. Controllers ----------
builder.Services.AddControllers();

// ---------- 4. Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee Department API - Dapper & ADO.NET",
        Version = "v1",
        Description = "Same CRUD contract, two data-access implementations: " +
                      "/api/dapper/* uses Dapper + Stored Procedures, /api/ado/* uses raw ADO.NET + Stored Procedures."
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
