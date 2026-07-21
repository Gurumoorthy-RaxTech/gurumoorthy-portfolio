using System.Text.Json;

namespace MinimalApiMiddlewareDemo.Middleware;

// Catches anything unhandled from every middleware/endpoint that runs
// AFTER this one in the pipeline, logs it server-side, and replaces
// whatever would otherwise reach the client (by default: a raw exception
// page in Development, or a bare 500 with no body in Production) with a
// small, safe, structured JSON body. Nothing about the exception's
// message or stack trace is sent back to the caller - only a generic
// message plus the request's TraceIdentifier, which is enough to let a
// caller report "this request failed" and have it correlated with the
// matching server-side log entry, without leaking internals.
//
// MUST be registered FIRST in the pipeline (see Program.cs) - see the
// README for why.
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}",
                context.Request.Method, context.Request.Path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var errorResponse = new
            {
                error = "An unexpected error occurred.",
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
        }
    }
}
