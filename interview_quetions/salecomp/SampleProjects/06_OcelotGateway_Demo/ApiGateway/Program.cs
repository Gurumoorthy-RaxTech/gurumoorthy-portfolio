using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Load the Ocelot route configuration. AddJsonFile is layered on top of
// appsettings.json, so this file is what actually drives routing.
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Wires up Ocelot's DI: route matching, downstream HttpClient handling,
// rate limiting, load balancing, etc. - all driven by ocelot.json above.
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// Ocelot owns the whole request pipeline for anything matching a configured
// route - it is itself effectively "the routing middleware", so there is no
// app.MapControllers()/MapGet() here beyond this single call. UseOcelot() is
// async in the currently installed Ocelot version (24.1.0), so it is awaited
// directly rather than using the older ".Wait()" pattern.
await app.UseOcelot();

app.Run();
