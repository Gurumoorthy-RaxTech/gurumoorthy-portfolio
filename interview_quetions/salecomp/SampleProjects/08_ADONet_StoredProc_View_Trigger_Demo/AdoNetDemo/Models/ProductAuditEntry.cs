namespace AdoNetDemo.Models
{
    // Plain C# class mirroring one row of the ProductAudit table. The app
    // never writes rows into ProductAudit itself - every row here was
    // written by the trg_Product_Insert trigger as a side effect of an
    // INSERT into Product. Reading this table back is how the demo proves
    // the trigger actually fired.
    public class ProductAuditEntry
    {
        public int AuditId { get; set; }
        public int ProductId { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; }
    }
}
