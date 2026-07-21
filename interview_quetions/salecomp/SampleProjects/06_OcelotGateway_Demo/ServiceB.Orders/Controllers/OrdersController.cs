using Microsoft.AspNetCore.Mvc;
using ServiceB.Orders.Models;

namespace ServiceB.Orders.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        // In-memory sample data - no database needed. The whole point of this
        // demo is to show gateway ROUTING, not data access.
        private static readonly List<Order> _orders = new()
        {
            new Order { Id = 101, CustomerName = "Anita Sharma",  Status = "Shipped",   TotalAmount = 3098.00m,  OrderDate = new DateTime(2026, 7, 10) },
            new Order { Id = 102, CustomerName = "Ravi Kumar",    Status = "Pending",   TotalAmount = 15999.00m, OrderDate = new DateTime(2026, 7, 14) },
            new Order { Id = 103, CustomerName = "Meena Iyer",    Status = "Delivered", TotalAmount = 2499.00m,  OrderDate = new DateTime(2026, 7, 15) },
            new Order { Id = 104, CustomerName = "Sanjay Verma",  Status = "Cancelled", TotalAmount = 599.00m,   OrderDate = new DateTime(2026, 7, 16) },
        };

        // GET api/orders
        [HttpGet]
        public ActionResult<IEnumerable<Order>> GetAll()
        {
            return Ok(_orders);
        }

        // GET api/orders/{id}
        [HttpGet("{id:int}")]
        public ActionResult<Order> GetById(int id)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id);
            if (order == null)
            {
                return NotFound(new { message = $"Order {id} not found." });
            }

            return Ok(order);
        }
    }
}
