using Microsoft.EntityFrameworkCore;
using nondevhub_api.Data;
using nondevhub_api.Services;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. BUILDER PHASE: Register Services & Dependency Injection
// =========================================================================

// 1.1 อ่านค่า CORS จาก appsettings.json
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                    ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 1.2 เพิ่ม Controller & OpenAPI Services
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 1.3 ลงทะเบียน DbContext (SQL Server) และ Services ในระบบ
string connectionString = builder.Configuration.GetConnectionString("NonDevHub")!;
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IAuthService, AuthService>();

// =========================================================================
// 2. PIPELINE PHASE: Configure Middlewares & Routes
// =========================================================================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // 🟢 ใช้ HTTPS Redirection เฉพาะ Production ป้องกันปัญหา Redirect Loop/CORS ล้มเหลวใน Dev
    app.UseHttpsRedirection();
}

app.UseCors("AllowNextJS");
app.UseAuthorization();

// 2.1 Sample Async Weather API Endpoint
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/api/v1/weatherforecast", async () =>
{
    var forecast = await Task.Run(() => 
        Enumerable.Range(1, 5).Select(index =>
            new WeatherForecast
            (
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                summaries[Random.Shared.Next(summaries.Length)]
            )).ToArray()
    );

    return Results.Ok(forecast);
})
.WithName("GetWeatherForecast");

// 2.2 Map Controller Routes
app.MapControllers();

// 2.3 สั่งให้ Server เริ่มรัน
app.Run();

// =========================================================================
// 3. MODELS / RECORDS Definition
// =========================================================================
public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)Math.Round(TemperatureC / 0.5556);
}