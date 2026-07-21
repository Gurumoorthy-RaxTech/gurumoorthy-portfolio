namespace EmployeeDeptApi.Auth
{
    public interface ITokenService
    {
        string GenerateToken(string username, string role);
    }
}
