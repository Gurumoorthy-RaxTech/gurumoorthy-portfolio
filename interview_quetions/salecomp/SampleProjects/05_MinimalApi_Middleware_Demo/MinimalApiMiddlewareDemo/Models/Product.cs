namespace MinimalApiMiddlewareDemo.Models;

// A plain record for the domain entity. Records are a natural fit here -
// this is just a small, immutable-by-default data shape, no behavior.
public record Product(int Id, string Name, decimal Price, int Stock);

// DTOs for the request bodies. Kept separate from Product so the API
// consumer never has to (or is able to) supply an Id on create - the
// store assigns it - and so future request/response shapes can diverge
// from the storage shape without breaking callers.
public record ProductCreateDto(string Name, decimal Price, int Stock);

public record ProductUpdateDto(string Name, decimal Price, int Stock);
