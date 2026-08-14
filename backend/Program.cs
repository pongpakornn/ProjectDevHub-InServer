using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add Register Services
builder.Services.AddScoped<IAuthService, AuthService>();

// 3. Add CORS Policy for Next.js Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // URL ของ Next.js
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// 📌 [วางตรงนี้] คำนวณและ Print ค่า Hash ออกมาบน Terminal ก่อนเปิด Server

Console.WriteLine($"\n========================================");
Console.WriteLine($"[GENERATE HASH] USR001 = {BCrypt.Net.BCrypt.HashPassword("User@1234")}");
Console.WriteLine($"========================================\n");

// เปิดใช้งาน Server
app.Run();