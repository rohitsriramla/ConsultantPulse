using System.Security.Claims;
using DevTimer.Api.Data;
using DevTimer.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTimer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly DevTimerDbContext _db;
    public ClientsController(DevTimerDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var userId = GetUserId();
        var clients = await _db.Clients
            .Where(c => c.UserId == userId)
            .Include(c => c.Projects)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(clients);
    }

    public record CreateClientDto(string Name, string Company, string? Email, decimal HourlyRate, string Currency);

    [HttpPost]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientDto dto)
    {
        var client = new Client
        {
            UserId = GetUserId(),
            Name = dto.Name,
            Company = dto.Company,
            Email = dto.Email,
            HourlyRate = dto.HourlyRate,
            Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency
        };
        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return Ok(client);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(Guid id)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == id && c.UserId == GetUserId());
        if (client == null) return NotFound();
        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Client deleted successfully" });
    }
}
