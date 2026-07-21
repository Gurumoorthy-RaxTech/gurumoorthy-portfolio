namespace AdoNetDemo.Models
{
    // Plain C# class ("POCO") that mirrors one row of the Product table.
    // Property names/types here line up with the columns SELECTed in
    // ProductRepository - same convention as sibling project 01's Student.cs.
    public class Product
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }
}
