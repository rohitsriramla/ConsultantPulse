using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DevTimer.Api.Data;
using DevTimer.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DevTimer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DevTimerDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(DevTimerDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public record LoginDto(string Email, string Password);
    public record RegisterDto(string Email, string Password, string FullName);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = GenerateJwt(user);
        return Ok(new
        {
            token,
            user = new { user.Id, user.Email, user.FullName }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto req)
    {
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == req.Email.ToLower()))
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            Email = req.Email.Trim().ToLower(),
            FullName = req.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);
        return Ok(new { token, user = new { user.Id, user.Email, user.FullName } });
    }

    private string GenerateJwt(User user)
    {
        var secret = _config["Jwt:Key"] ?? "super_secret_consultant_jwt_devtimer_key_1234567890!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
