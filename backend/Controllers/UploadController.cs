using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly string _photoRoot;
    private readonly string _requestPath;

    public UploadController(IConfiguration config)
    {
        _photoRoot = config["PhotoStorage:RootPath"]!;
        _requestPath = config["PhotoStorage:RequestPath"]!;
    }

    // ตัด Character ที่ระบบไฟล์ห้ามใช้ออก (ทั้ง Windows/Linux) + ตัดความยาวกันชน MAX_PATH
    // คืนค่า fallback ถ้าหลัง Sanitize แล้วว่างเปล่า (เช่น ชื่อเป็นแค่สัญลักษณ์ล้วนๆ)
    private static string SanitizeForFileSystem(string? raw, string fallback)
    {
        if (string.IsNullOrWhiteSpace(raw)) return fallback;

        var invalidChars = Path.GetInvalidFileNameChars();
        var cleaned = new string(raw.Where(c => !invalidChars.Contains(c)).ToArray()).Trim();
        cleaned = string.Join(" ", cleaned.Split(' ', StringSplitOptions.RemoveEmptyEntries));

        if (cleaned.Length > 80) cleaned = cleaned[..80].Trim();

        return string.IsNullOrWhiteSpace(cleaned) ? fallback : cleaned;
    }

    // หาชื่อไฟล์ที่ไม่ชนกับไฟล์เดิมในโฟลเดอร์ โดยเติม _2, _3, ... ต่อท้ายจนกว่าจะว่าง
    // (กันกรณีสอง Showcase ในโปรเจกต์เดียวกันตั้ง "ชื่อหน้า" ซ้ำกัน ไม่ให้ไฟล์เก่าถูกเขียนทับเงียบๆ)
    private static string ResolveAvailableFileName(string folder, string baseName, string ext)
    {
        var candidate = $"{baseName}{ext}";
        var counter = 2;
        while (System.IO.File.Exists(Path.Combine(folder, candidate)))
        {
            candidate = $"{baseName}_{counter}{ext}";
            counter++;
        }
        return candidate;
    }

    // POST /api/Upload/showcase-image?projectId=5&projectName=...&pageName=...
    // ★ โฟลเดอร์ตั้งชื่อตาม "ชื่อโปรเจกต์" และไฟล์ตั้งชื่อตาม "ชื่อหน้า" (Showcase Title) แทน projectId/GUID เดิม
    //   เพื่อให้เปิดโฟลเดอร์ในเครื่องแล้วรู้ทันทีว่าเป็นรูปของโปรเจกต์/หน้าไหน
    [HttpPost("showcase-image")]
    public async Task<IActionResult> UploadShowcaseImage(
        IFormFile file,
        [FromQuery] int projectId,
        [FromQuery] string? projectName,
        [FromQuery] string? pageName)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "ไม่พบไฟล์รูปภาพ" });

        if (projectId <= 0)
            return BadRequest(new { message = "ไม่พบ projectId" });

        var allowedExt = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExt.Contains(ext))
            return BadRequest(new { message = "รองรับเฉพาะไฟล์ jpg, jpeg, png, webp" });

        var folderName = SanitizeForFileSystem(projectName, projectId.ToString());
        var projectFolder = Path.Combine(_photoRoot, folderName);
        Directory.CreateDirectory(projectFolder); // สร้างอัตโนมัติถ้ายังไม่มี ไม่ error ถ้ามีอยู่แล้ว

        var baseFileName = SanitizeForFileSystem(pageName, Guid.NewGuid().ToString());
        var fileName = ResolveAvailableFileName(projectFolder, baseFileName, ext);
        var fullPath = Path.Combine(projectFolder, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // path ที่ frontend จะใช้แสดงผล เช่น /photos/MyProject/Login Page.jpg
        var url = $"{_requestPath}/{Uri.EscapeDataString(folderName)}/{Uri.EscapeDataString(fileName)}";
        return Ok(new { url });
    }

    // POST /api/Upload/attachment?projectId=5 — ไฟล์แนบทั่วไปของ Project.Attachments (ไม่จำกัดเฉพาะรูปภาพ)
    [HttpPost("attachment")]
    public async Task<IActionResult> UploadAttachment(IFormFile file, [FromQuery] int projectId)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "ไม่พบไฟล์แนบ" });

        if (projectId <= 0)
            return BadRequest(new { message = "ไม่พบ projectId" });

        const long maxSizeBytes = 25 * 1024 * 1024; // 25 MB
        if (file.Length > maxSizeBytes)
            return BadRequest(new { message = "ไฟล์มีขนาดใหญ่เกิน 25 MB" });

        var attachmentFolder = Path.Combine(_photoRoot, "attachments", projectId.ToString());
        Directory.CreateDirectory(attachmentFolder);

        var ext = Path.GetExtension(file.FileName);
        var storedFileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(attachmentFolder, storedFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"{_requestPath}/attachments/{projectId}/{storedFileName}";
        return Ok(new { url, fileName = file.FileName, fileSizeByte = file.Length });
    }
}