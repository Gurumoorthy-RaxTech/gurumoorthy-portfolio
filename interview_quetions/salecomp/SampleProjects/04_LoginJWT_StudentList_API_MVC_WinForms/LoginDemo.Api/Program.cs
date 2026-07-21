using System.Text;
using LoginDemo.Api.Data;
using LoginDemo.Api.Repositories;
using LoginDemo.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Dapper data access
builder.Services.AddScoped<DapperContext>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddSingleton<JwtTokenService>();

// JWT Bearer authentication. Both the MVC Web app and the WinForms app send
// back whatever token AuthController.Login issued as an
// "Authorization: Bearer <token>" header, and this validates it against the
// same Jwt:Key/Issuer/Audience that JwtTokenService signed it with.
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// This API is deliberately HTTP-only (see launchSettings.json - only the
// "http" profile exists, fixed at http://localhost:5299). That keeps the
// WinForms desktop client and the MVC server from having to deal with dev
// HTTPS certificate trust, and there's no browser involved for the
// WinForms/MVC-server calls anyway, so HTTPS redirection is skipped.
// app.UseHttpsRedirection();

// Authentication MUST run before Authorization, and both must run before
// MapControllers so [Authorize] on StudentsController actually gets
// enforced.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
