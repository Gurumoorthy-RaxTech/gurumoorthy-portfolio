using MinimalApiMiddlewareDemo;
using MinimalApiMiddlewareDemo.Data;
using MinimalApiMiddlewareDemo.Middleware;

var builder = WebApplication.CreateBuilder(args);

// One shared in-memory store for the whole app's lifetime. See
// Data/ProductStore.cs for why this is a DI-registered Singleton class
// rather than a raw static list.
builder.Services.AddSingleton<ProductStore>();

var app = builder.Build();

// ---------------------------------------------------------------------
// MIDDLEWARE PIPELINE - ORDER MATTERS
//
// Requests flow through this list top-to-bottom; responses flow back
// through it bottom-to-top. Each piece only sees what happens INSIDE the
// await next(context) call of everything registered before it.
//
// 1. GlobalExceptionMiddleware goes FIRST so its try/catch wraps
//    absolutely everything else - the timing middleware, routing,
//    and every endpoint handler. If it were registered later (e.g.
//    after RequestTimingMiddleware, or after routing/endpoints), an
//    exception thrown by anything registered BEFORE it would never
//    reach its catch block at all, and the caller would get the
//    default ASP.NET Core behavior (a raw developer exception page
//    or an empty 500) instead of the clean JSON body. Concretely: if
//    RequestTimingMiddleware ran before GlobalExceptionMiddleware and
//    a downstream endpoint threw, the exception would unwind straight
//    past RequestTimingMiddleware's "await _next(context)" and out of
//    the pipeline before ever reaching the exception handler - no JSON
//    error body, no stopwatch log line either, just an unhandled crash.
//
// 2. RequestTimingMiddleware goes next so it measures the FULL cost of
//    everything downstream (routing + endpoint execution), while still
//    being inside the exception middleware's safety net - if a request
//    blows up, GlobalExceptionMiddleware still catches it even though
//    the timing middleware is "in front of" it in the pipeline.
//
// 3. Routing/endpoints go last - by the time a request reaches an
//    endpoint, it's already covered by both exception handling and
//    timing.
// ---------------------------------------------------------------------

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<RequestTimingMiddleware>();

// Inline middleware example: a one-off, stateless concern (stamping a
// response header) that doesn't need DI dependencies or its own class.
// Reach for app.Use(...) like this for small, single-purpose, non-reused
// logic; reach for a class (like the two above) once something needs
// constructor-injected dependencies, gets reused across projects, or is
// substantial enough to want its own unit tests.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Powered-By"] = "MinimalApiMiddlewareDemo";
    await next(context);
});

// Endpoints are extracted into ProductEndpoints.cs (an extension method
// on IEndpointRouteBuilder) instead of being inlined here, so Program.cs
// stays a short table of contents even as more features get added.
app.MapProductEndpoints();

app.Run();
