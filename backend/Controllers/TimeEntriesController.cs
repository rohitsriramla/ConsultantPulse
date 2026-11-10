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
public class TimeEntriesController : ControllerBase
{
    private readonly DevTimerDbContext _db;
    public TimeEntriesController(DevTimerDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetEntries([FromQuery] Guid? clientId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var userId = GetUserId();
        var query = _db.TimeEntries.Where(t => t.UserId == userId);

        if (clientId.HasValue) query = query.Where(t => t.ClientId == clientId.Value);
        if (from.HasValue) query = query.Where(t => t.StartTime >= from.Value);
        if (to.HasValue) query = query.Where(t => t.EndTime <= to.Value);

        var entries = await query.OrderByDescending(t => t.StartTime).ToListAsync();
        return Ok(entries);
    }

    public record ManualEntryDto(Guid ClientId, Guid? ProjectId, string TaskName, DateTime StartTime, DateTime EndTime, bool IsBillable, string? Notes);

    [HttpPost]
    public async Task<IActionResult> CreateEntry([FromBody] ManualEntryDto dto)
    {
        var duration = Math.Round((decimal)(dto.EndTime - dto.StartTime).TotalHours, 2);
        var entry = new TimeEntry
        {
            UserId = GetUserId(),
            ClientId = dto.ClientId,
            ProjectId = dto.ProjectId,
            TaskName = dto.TaskName,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            DurationHours = duration > 0 ? duration : 0.25m,
            IsBillable = dto.IsBillable,
            RawNotes = dto.Notes,
            AiSummary = !string.IsNullOrWhiteSpace(dto.Notes) ? $"• {dto.Notes}" : null
        };
        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        return Ok(entry);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEntry(Guid id)
    {
        var entry = await _db.TimeEntries.FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUserId());
        if (entry == null) return NotFound();
        _db.TimeEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Time entry deleted" });
    }
}
