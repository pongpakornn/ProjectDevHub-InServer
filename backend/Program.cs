using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;   // ★ เพิ่ม using นี้

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectSoloService, ProjectSoloService>();
builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();

// 3. Add CORS Policy for Next.js Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
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

// ★ เพิ่มบล็อกนี้ — สร้าง root folder อัตโนมัติ + เปิดให้เข้าถึงไฟล์รูปผ่าน URL
var photoRoot = builder.Configuration["PhotoStorage:RootPath"]!;
var photoRequestPath = builder.Configuration["PhotoStorage:RequestPath"]!;
Directory.CreateDirectory(photoRoot);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(photoRoot),
    RequestPath = photoRequestPath
});

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine($"\n========================================");
Console.WriteLine($"[GENERATE HASH] USR001 = {BCrypt.Net.BCrypt.HashPassword("User@1234")}");
Console.WriteLine($"========================================\n");

app.Run();