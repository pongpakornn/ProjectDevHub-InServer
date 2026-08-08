# Backend API

Run the API:

```powershell
dotnet run
```

Store the SQL Server password in .NET User Secrets (not in source control):

```powershell
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:ChrSync" "Server=DESKTOP-TJ7525D\SQLEXPRESS;Database=ProjectDevHub;User Id=sa;Password=123;Encrypt=True;TrustServerCertificate=True;Connection Timeout=5"
```

Test with `GET http://localhost:5294/api/health/database`. The endpoint is enabled only in the Development environment; protect it with authentication before enabling an equivalent diagnostic endpoint in production.
