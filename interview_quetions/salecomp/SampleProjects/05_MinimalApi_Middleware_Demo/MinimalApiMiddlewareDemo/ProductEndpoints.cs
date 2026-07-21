using Microsoft.AspNetCore.Mvc;
using MinimalApiMiddlewareDemo.Data;
using MinimalApiMiddlewareDemo.Models;

namespace MinimalApiMiddlewareDemo;

// This is the answer to "how do you stop Program.cs from turning into an
// unreadable pile of lambdas as a Minimal API grows": pull each feature's
// endpoints out into its own static class with a MapXxxEndpoints extension
// method, and have Program.cs call one line per feature. Program.cs stays
// a short, readable table of contents; the actual handler logic lives
// next to the feature it belongs to (same idea as a controller, minus the
// controller base class and attribute routing ceremony).
public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        // Route groups let you set a shared prefix ("/api/products") once
        // and, if needed later, attach shared metadata (auth, rate
        // limiting, OpenAPI tags, filters) to every endpoint in the group
        // in one place instead of repeating it on every MapGet/MapPost call.
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:int}", GetById);
        group.MapPost("/", Create);
        group.MapPut("/{id:int}", Update);
        group.MapDelete("/{id:int}", Delete);

        // Deliberately broken endpoint used to prove the global exception
        // middleware works: it throws before any handler-level try/catch
        // could intervene, so whatever comes back to the client is purely
        // a result of the middleware pipeline. Registered under the same
        // group so it shows up next to the other product routes.
        group.MapGet("/boom", Boom);

        return app;
    }

    private static IResult GetAll(ProductStore store)
    {
        return Results.Ok(store.GetAll());
    }

    private static IResult GetById(int id, ProductStore store)
    {
        var product = store.GetById(id);
        return product is not null ? Results.Ok(product) : Results.NotFound();
    }

    private static IResult Create([FromBody] ProductCreateDto dto, ProductStore store)
    {
        var created = store.Add(dto);
        return Results.Created($"/api/products/{created.Id}", created);
    }

    private static IResult Update(int id, [FromBody] ProductUpdateDto dto, ProductStore store)
    {
        return store.Update(id, dto) ? Results.NoContent() : Results.NotFound();
    }

    private static IResult Delete(int id, ProductStore store)
    {
        return store.Delete(id) ? Results.NoContent() : Results.NotFound();
    }

    private static IResult Boom()
    {
        throw new InvalidOperationException("Deliberate test exception");
    }
}
