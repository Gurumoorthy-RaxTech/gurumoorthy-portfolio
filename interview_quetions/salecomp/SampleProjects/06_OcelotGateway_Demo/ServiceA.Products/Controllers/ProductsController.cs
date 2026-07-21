using Microsoft.AspNetCore.Mvc;
using ServiceA.Products.Models;

namespace ServiceA.Products.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        // In-memory sample data - no database needed. The whole point of this
        // demo is to show gateway ROUTING, not data access.
        private static readonly List<Product> _products = new()
        {
            new Product { Id = 1, Name = "Wireless Mouse",      Category = "Accessories", Price = 599.00m,  StockQty = 120 },
            new Product { Id = 2, Name = "Mechanical Keyboard",  Category = "Accessories", Price = 2499.00m, StockQty = 45  },
            new Product { Id = 3, Name = "27-inch Monitor",      Category = "Displays",    Price = 15999.00m, StockQty = 18 },
            new Product { Id = 4, Name = "USB-C Docking Station", Category = "Accessories", Price = 3299.00m, StockQty = 60 },
        };

        // GET api/products
        [HttpGet]
        public ActionResult<IEnumerable<Product>> GetAll()
        {
            return Ok(_products);
        }

        // GET api/products/{id}
        [HttpGet("{id:int}")]
        public ActionResult<Product> GetById(int id)
        {
            var product = _products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { message = $"Product {id} not found." });
            }

            return Ok(product);
        }
    }
}
