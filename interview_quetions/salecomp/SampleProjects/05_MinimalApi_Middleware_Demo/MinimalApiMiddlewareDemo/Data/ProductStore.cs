using MinimalApiMiddlewareDemo.Models;

namespace MinimalApiMiddlewareDemo.Data;

// A tiny in-memory "database" so this sample needs zero DB setup to run.
// Registered as a Singleton in DI (see Program.cs) rather than a bare
// static list/class, because:
//   - it can be constructor-injected into endpoint handlers/services just
//     like a real repository would be, which is the pattern you'd actually
//     use once this became EF Core / Dapper / whatever;
//   - it's swappable in tests behind the same "one instance shared across
//     the app's lifetime" semantics a real DB-backed singleton-scoped
//     repository would have (well, real repos are usually Scoped, but the
//     point - DI-managed lifetime instead of a hardcoded static - stands).
public class ProductStore
{
    private readonly List<Product> _products;
    private int _nextId;

    public ProductStore()
    {
        _products =
        [
            new Product(1, "Wireless Mouse", 799.00m, 120),
            new Product(2, "Mechanical Keyboard", 3499.00m, 45),
            new Product(3, "USB-C Hub", 1299.00m, 80),
            new Product(4, "27-inch Monitor", 15999.00m, 15),
            new Product(5, "Webcam 1080p", 2199.00m, 60)
        ];
        _nextId = _products.Max(p => p.Id) + 1;
    }

    public IReadOnlyList<Product> GetAll() => _products;

    public Product? GetById(int id) => _products.FirstOrDefault(p => p.Id == id);

    public Product Add(ProductCreateDto dto)
    {
        var product = new Product(_nextId++, dto.Name, dto.Price, dto.Stock);
        _products.Add(product);
        return product;
    }

    public bool Update(int id, ProductUpdateDto dto)
    {
        var index = _products.FindIndex(p => p.Id == id);
        if (index == -1)
        {
            return false;
        }

        _products[index] = _products[index] with
        {
            Name = dto.Name,
            Price = dto.Price,
            Stock = dto.Stock
        };
        return true;
    }

    public bool Delete(int id)
    {
        var product = GetById(id);
        if (product is null)
        {
            return false;
        }

        _products.Remove(product);
        return true;
    }
}
