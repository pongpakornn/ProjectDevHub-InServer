using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nondevhub_api.Controllers.V1;
using nondevhub_api.Data;
using Xunit;

namespace nondevhub_api.tests
{
    public class HealthControllerTests
    {
        [Fact]
        public async Task CheckDbConnection_WhenDbIsAvailable_ReturnsOkResult()
        {
            // Arrange: จำลอง AppDbContext ในหน่วยความจำ (In-Memory DB)
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "HealthDbTest")
                .Options;

            using var context = new AppDbContext(options);
            var controller = new HealthController(context);

            // Act: เรียกใช้ Action CheckDbConnection
            var result = await controller.CheckDbConnection(CancellationToken.None);

            // Assert: ตรวจสอบผลลัพธ์ว่าได้ HTTP 200 OK
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}