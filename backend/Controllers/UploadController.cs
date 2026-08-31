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

    // POST /api/Upload/showcase-image?projectId=5
    [HttpPost("showcase-image")]
    public async Task<IActionResult> UploadShowcaseImage(IFormFile file, [FromQuery] int projectId)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "ไม่พบไฟล์รูปภาพ" });

        if (projectId <= 0)
            return BadRequest(new { message = "ไม่พบ projectId" });

        var allowedExt = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExt.Contains(ext))
            return BadRequest(new { message = "รองรับเฉพาะไฟล์ jpg, jpeg, png, webp" });

        // ★ สร้างโฟลเดอร์แยกตามโปรเจค เช่น Photo Systems/5/xxx.jpg
        var projectFolder = Path.Combine(_photoRoot, projectId.ToString());
        Directory.CreateDirectory(projectFolder); // สร้างอัตโนมัติถ้ายังไม่มี ไม่ error ถ้ามีอยู่แล้ว

        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(projectFolder, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // path ที่ frontend จะใช้แสดงผล เช่น /photos/5/xxxxx.jpg
        var url = $"{_requestPath}/{projectId}/{fileName}";
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