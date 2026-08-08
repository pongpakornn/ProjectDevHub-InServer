using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. อ่านค่า CORS จาก appsettings.json
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                     ?? new[] { "http://localhost:3000" };

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

// 2. เพิ่ม Services ที่จำเป็นในระบบ
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 3. (พร้อมขยาย) ตั้งค่า DbContext สำหรับเชื่อม SQL Server
// string connectionString = builder.Configuration.GetConnectionString("ChrSync")!;
// builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

var app = builder.Build();

// 4. Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJS");
app.UseAuthorization();

// 5. Sample Async Weather API Endpoint (Non-blocking)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/api/v1/weatherforecast", async () =>
{
    // ใช้ Task.Run หรือ Async Data Fetching เพื่อการทำงานแบบ Non-blocking
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

// Map Controllers สำหรับ API Routes ที่จะสร้างเพิ่มในอนาคต
app.MapControllers();

app.Run();

// Test : เเล้วมันเกิดบัคหรือ Error เกิดขึ้นเนื่องจากสูตรคำนวณค่า Fahrenheit ไม่ถูกต้อง (ควรใช้ Math.Round เพื่อปัดเศษให้ถูกต้อง)
// public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }
public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)Math.Round(TemperatureC / 0.5556);
    // หรือใช้อีกสูตรมาตรฐาน: public int TemperatureF => 32 + (int)Math.Round(TemperatureC * 1.8);
}