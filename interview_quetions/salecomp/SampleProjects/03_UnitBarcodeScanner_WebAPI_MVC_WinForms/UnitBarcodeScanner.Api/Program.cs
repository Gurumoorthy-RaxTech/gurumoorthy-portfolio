using UnitBarcodeScanner.Api.Data;
using UnitBarcodeScanner.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Dapper data access
builder.Services.AddScoped<DapperContext>();
builder.Services.AddScoped<IUnitRepository, UnitRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// This API is deliberately HTTP-only (see launchSettings.json - only the
// "http" profile exists, fixed at http://localhost:5199). That keeps the
// WinForms desktop client and the MVC server from having to deal with dev
// HTTPS certificate trust, and there's no browser involved for the
// WinForms/MVC-server calls anyway, so HTTPS redirection is skipped.
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
