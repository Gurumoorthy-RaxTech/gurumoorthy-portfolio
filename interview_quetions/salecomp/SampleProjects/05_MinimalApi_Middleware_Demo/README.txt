MinimalApiMiddlewareDemo - ASP.NET Core 8 Minimal APIs + Custom Middleware
====================================================================

WHAT THIS DEMONSTRATES
  A small, self-contained ASP.NET Core 8 Minimal API - no database, no
  external dependencies - built specifically to be read end-to-end in a
  few minutes and to answer two common interview follow-ups:

    1. "Show me a Minimal API that isn't just a toy `app.MapGet` one-liner"
       - full CRUD (GET all, GET by id, POST, PUT, DELETE) using typed
         results (Results.Ok / Results.NotFound / Results.Created /
         Results.NoContent) instead of returning raw objects, plus a
         RouteGroupBuilder (app.MapGroup("/api/products")) and the
         handlers extracted into their own static class
         (ProductEndpoints.cs, via a MapProductEndpoints extension
         method) instead of being inlined in Program.cs. That combo -
         group + extension method - is the real answer to "how do you
         stop Program.cs turning into an unreadable pile of lambdas as
         the API grows": Program.cs ends up as a short table of
         contents, and each feature's routes live in their own file
         next to their own logic.

    2. "Write me a custom middleware, and explain pipeline order"
       - three different ways to add middleware, side by side, so the
         difference is visible in one file:
           - Middleware/GlobalExceptionMiddleware.cs - a real class
             (constructor takes RequestDelegate + ILogger via DI),
             registered FIRST in the pipeline, wraps everything after
             it in a try/catch and turns any unhandled exception into
             a clean JSON 500 instead of a stack trace.
           - Middleware/RequestTimingMiddleware.cs - another real class,
             registered second, times every request with a Stopwatch and
             logs "[timing] {method} {path} took {ms}ms".
           - one INLINE app.Use(...) lambda directly in Program.cs that
             just stamps a response header (X-Powered-By). See the "class
             vs inline" note below.

  No database is used anywhere. Products live in Data/ProductStore.cs,
  an in-memory List<Product> wrapped in a small class registered as a DI
  Singleton (so it behaves like a real repository would - constructor-
  injectable, one shared instance for the app's lifetime - without any
  actual DB setup friction). That's a deliberate choice for a portfolio
  sample: the point of this project is the API/middleware shape, and a
  database would just be friction between a reviewer and running it.

WHY MIDDLEWARE ORDER MATTERS (and what would break if it were different)
  Requests flow through the pipeline top-to-bottom in the order
  middleware is registered in Program.cs; responses (and exceptions)
  flow back through the SAME chain bottom-to-top. A middleware can only
  see what happens INSIDE its own "await next(context)" call - anything
  registered before it is invisible to it.

  This project registers, in order:
    1. GlobalExceptionMiddleware
    2. RequestTimingMiddleware
    3. the inline X-Powered-By header middleware
    4. routing / the product endpoints (ProductEndpoints.cs)

  GlobalExceptionMiddleware is registered FIRST specifically so its
  try/catch wraps EVERYTHING that runs after it - the timing middleware,
  the header middleware, routing, and every endpoint handler, including
  the deliberately-broken GET /api/products/boom.

  If GlobalExceptionMiddleware were registered LAST instead (say, after
  RequestTimingMiddleware, or after app.MapProductEndpoints()), here's
  concretely what breaks: when GET /api/products/boom throws, the
  exception unwinds back up through RequestTimingMiddleware's
  "await _next(context)" line - which means it exits BEFORE reaching
  RequestTimingMiddleware's own logging line, so you wouldn't even get a
  timing log for the failed request - and keeps unwinding past where
  GlobalExceptionMiddleware would have been, straight out of the
  pipeline. The caller would get ASP.NET Core's default behavior (an
  ugly raw exception/stack-trace page in Development, or a bare, bodiless
  500 in Production) instead of the clean
  { "error": "...", "traceId": "..." } JSON body. Exception handling has
  to be the outermost layer to catch failures from every layer inside it -
  that's true in this project and in any real ASP.NET Core app.

  (You can actually observe a smaller version of this same effect even
  with the CORRECT ordering: because GET /api/products/boom throws
  inside the endpoint, RequestTimingMiddleware's own "await next()" call
  also never returns normally for that one request, so no "[timing] GET
  /api/products/boom took Xms" line appears in the console - only the
  GlobalExceptionMiddleware's error log does. Nothing is broken; it's
  just a good concrete example of "code after an unhandled throw in a
  middleware doesn't run" that's worth being able to explain out loud.)

WHEN TO WRITE A MIDDLEWARE CLASS VS. AN INLINE app.Use(...) LAMBDA
  See the comment right above the inline example in Program.cs. Short
  version: inline app.Use(...) is fine for something small, stateless,
  and used once (like stamping one response header here). Reach for a
  full class - constructor + InvokeAsync, like the two in Middleware/ -
  once the logic needs a DI dependency (a logger, a scoped service,
  configuration), is reused across projects, or is substantial enough
  that you'd want a unit test for it on its own.

HOW TO RUN
  1. Open MinimalApiMiddlewareDemo.sln in Visual Studio (or run
     `dotnet run --project MinimalApiMiddlewareDemo` from this folder).

  2. The app listens on a fixed HTTP-only port:
       http://localhost:5298
     (see MinimalApiMiddlewareDemo/Properties/launchSettings.json - the
     https profile was removed so there's no cert-trust prompt and the
     URL below is always correct.)

  3. Try the endpoints - with a browser, curl, or Postman:

     GET all products:
       curl http://localhost:5298/api/products

     GET one product:
       curl http://localhost:5298/api/products/1
       curl http://localhost:5298/api/products/999    (-> 404)

     POST a new product:
       curl -X POST http://localhost:5298/api/products ^
         -H "Content-Type: application/json" ^
         -d "{\"name\":\"Test Item\",\"price\":100,\"stock\":5}"
       (-> 201 Created, Location header points at the new /api/products/{id})

     PUT (update) a product:
       curl -X PUT http://localhost:5298/api/products/1 ^
         -H "Content-Type: application/json" ^
         -d "{\"name\":\"Wireless Mouse Pro\",\"price\":899,\"stock\":100}"
       (-> 204 No Content; try id 999 too, -> 404)

     DELETE a product:
       curl -X DELETE http://localhost:5298/api/products/2
       (-> 204 No Content; try id 999 too, -> 404)

     Trigger the exception middleware:
       curl -i http://localhost:5298/api/products/boom
       (-> HTTP 500, Content-Type: application/json, body:
        {"error":"An unexpected error occurred.","traceId":"..."} -
        no stack trace reaches the client)

  4. Watch the console window while you do this - every request prints a
     "[timing] {METHOD} {path} took {N}ms" line from
     RequestTimingMiddleware (except /boom, see the note above), and the
     /boom request additionally prints a full server-side error log from
     GlobalExceptionMiddleware. Every response, success or failure, also
     carries the "X-Powered-By: MinimalApiMiddlewareDemo" header from the
     inline middleware - check it with `curl -i`.

PROJECT LAYOUT
  MinimalApiMiddlewareDemo.sln
  MinimalApiMiddlewareDemo/
    Properties/launchSettings.json   - fixed HTTP-only port 5298, no https profile
    Program.cs                       - DI wiring, middleware pipeline (with
                                        the ordering comment), inline
                                        header middleware, calls
                                        MapProductEndpoints()
    Models/Product.cs                - Product record + ProductCreateDto /
                                        ProductUpdateDto request DTOs
    Data/ProductStore.cs             - in-memory List<Product>, DI Singleton,
                                        seeded with 5 sample products
    ProductEndpoints.cs              - MapProductEndpoints extension method:
                                        the route group + all 5 CRUD handlers
                                        + the /boom test endpoint
    Middleware/
      GlobalExceptionMiddleware.cs   - class-based, registered FIRST,
                                        catches everything, returns clean
                                        JSON 500 + traceId
      RequestTimingMiddleware.cs     - class-based, registered SECOND,
                                        Stopwatch + ILogger, logs request
                                        duration

See the chat response for a line-by-line walkthrough of the pipeline
ordering reasoning and the route group / extension method organization
pattern.
