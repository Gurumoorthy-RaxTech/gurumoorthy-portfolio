using Dapper;
using UnitBarcodeScanner.Api.Data;
using UnitBarcodeScanner.Api.Models;
using UnitBarcodeScanner.Api.Models.Dtos;

namespace UnitBarcodeScanner.Api.Repositories;

/// <summary>
/// All data access for Unit / ScanHistory lives here, via Dapper (raw SQL,
/// no ORM change-tracking) - this mirrors the ADO.NET-style, hand-written-SQL
/// approach used by the sibling ADO.NET sample projects, just with Dapper
/// doing the boilerplate mapping.
/// </summary>
public class UnitRepository : IUnitRepository
{
    private readonly DapperContext _context;

    public UnitRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<Unit> SaveUnitAsync(SaveUnitRequest request)
    {
        using var connection = _context.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Look up the Unit by barcode first - a scanner may scan the
            // same physical unit many times, and each scan should just add
            // a new ScanHistory row rather than create duplicate Units.
            var existingUnit = await connection.QuerySingleOrDefaultAsync<Unit>(
                "SELECT UnitId, Barcode, Status, CreatedDate FROM Unit WHERE Barcode = @Barcode",
                new { request.Barcode },
                transaction);

            Unit unit;

            if (existingUnit is null)
            {
                const string insertUnitSql = @"
                    INSERT INTO Unit (Barcode, Status, CreatedDate)
                    OUTPUT INSERTED.UnitId, INSERTED.Barcode, INSERTED.Status, INSERTED.CreatedDate
                    VALUES (@Barcode, 'Active', GETDATE());";

                unit = await connection.QuerySingleAsync<Unit>(
                    insertUnitSql,
                    new { request.Barcode },
                    transaction);
            }
            else
            {
                // Unit already exists - mark it Scanned and reuse its id.
                const string updateUnitSql = @"
                    UPDATE Unit SET Status = 'Scanned' WHERE UnitId = @UnitId;";

                await connection.ExecuteAsync(updateUnitSql, new { existingUnit.UnitId }, transaction);

                existingUnit.Status = "Scanned";
                unit = existingUnit;
            }

            const string insertHistorySql = @"
                INSERT INTO ScanHistory (UnitId, OperatorName, ScanTime)
                VALUES (@UnitId, @OperatorName, GETDATE());";

            await connection.ExecuteAsync(
                insertHistorySql,
                new { unit.UnitId, request.OperatorName },
                transaction);

            transaction.Commit();
            return unit;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<ScanHistoryDto>> GetHistoryAsync()
    {
        using var connection = _context.CreateConnection();

        const string sql = @"
            SELECT
                sh.HistoryId,
                u.Barcode,
                sh.OperatorName,
                sh.ScanTime
            FROM ScanHistory sh
            INNER JOIN Unit u ON u.UnitId = sh.UnitId
            ORDER BY sh.ScanTime DESC;";

        return await connection.QueryAsync<ScanHistoryDto>(sql);
    }
}
