using System.Diagnostics;

namespace MinimalApiMiddlewareDemo.Middleware;

// A "real" middleware class - constructor takes the next delegate (and,
// via DI, anything else it needs, here an ILogger), and the work happens
// in InvokeAsync. This is the pattern to reach for over app.Use(...) when
// the middleware has a dependency that should come from DI (a logger, a
// scoped service, configuration, etc.) or when it's substantial/reusable
// enough to deserve its own testable class instead of living as an inline
// lambda in Program.cs.
public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        // Always call the next thing in the pipeline - forgetting this is
        // the single most common middleware bug, and it silently makes
        // every request downstream (routing, endpoint execution, everything)
        // just never run.
        await _next(context);

        stopwatch.Stop();

        _logger.LogInformation(
            "[timing] {Method} {Path} took {ElapsedMilliseconds}ms",
            context.Request.Method,
            context.Request.Path,
            stopwatch.ElapsedMilliseconds);
    }
}
