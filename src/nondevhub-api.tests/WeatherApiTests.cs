using Xunit;

namespace NonDevHub.Api.Tests;

public class WeatherApiTests
{
    [Fact]
    public void TemperatureConversion_ShouldCalculateFahrenheitCorrectly()
    {
        // 1. Arrange (เตรียมข้อมูลจำลอง: อุณหภูมิ 25 องศาเซลเซียส)
        var forecast = new WeatherForecast(DateOnly.FromDateTime(DateTime.Now), 25, "Warm");

        // 2. Act (เรียกประมวลผลคำนวณค่า Fahrenheit จาก Property ใน Class)
        int actualFahrenheit = forecast.TemperatureF;

        // 3. Assert (ตรวจสอบว่า 25°C ได้ผลลัพธ์เป็น 77°F ตรงตามสูตรหรือไม่)
        Assert.Equal(77, actualFahrenheit);
    }
}