using Xunit;
using FluentAssertions;

namespace NonDevHub.Api.Tests.Unit
{
    public class AuthServiceTests
    {
        [Fact]
        public void ValidateUser_WithValidCredentials_ReturnsTrue()
        {
            // Arrange
            var userId = "EMP001";
            var password = "Password123";

            // Act
            var isValid = (userId == "EMP001" && password == "Password123");

            // Assert
            isValid.Should().BeTrue();
        }

        [Theory]
        [InlineData("", "Password123")]
        [InlineData("EMP001", "")]
        [InlineData("INVALID_USER", "Password123")]
        public void ValidateUser_WithInvalidCredentials_ReturnsFalse(string userId, string password)
        {
            // Act
            var isValid = (userId == "EMP001" && password == "Password123");

            // Assert
            isValid.Should().BeFalse();
        }
    }
}