var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// No HTTPS redirect - this service runs HTTP-only on a fixed port so the
// gateway (and anything else calling it) has a stable, cert-trust-free
// address, same reasoning as the sibling ADO.NET/WebAPI sample projects.

app.UseAuthorization();

app.MapControllers();

app.Run();
