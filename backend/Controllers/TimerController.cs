using System.Security.Claims;
using DevTimer.Api.Data;
using DevTimer.Api.Models;
using DevTimer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevTimer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimerController : ControllerBase
{
    private readonly IRedisTimerService _redisTimer;
    private readonly DevTimerDbContext _db;

    public TimerController(IRedisTimerService redisTimer, DevTimerDbContext db)
    {
        _redisTimer = redisTimer;
        _db = db;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public record StartTimerRequest(Guid ClientId, Guid? ProjectId, string TaskName, bool IsBillable, string? Notes);

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var active = await _redisTimer.GetActiveTimerAsync(GetUserId());
        return Ok(new { isRunning = active != null, timer = active });
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartTimer([FromBody] StartTimerRequest req)
    {
        var userId = GetUserId();
        var state = new ActiveTimerState(
            UserId: userId,
            ClientId: req.ClientId,
            ProjectId: req.ProjectId,
            TaskName: req.TaskName,
            StartTime: DateTime.UtcNow,
            IsBillable: req.IsBillable,
            Notes: req.Notes
        );

        await _redisTimer.SetActiveTimerAsync(userId, state);
        return Ok(new { message = "Timer started", timer = state });
    }

    [HttpPost("stop")]
    public async Task<IActionResult> StopTimer()
    {
        var userId = GetUserId();
        var active = await _redisTimer.GetActiveTimerAsync(userId);
        if (active == null)
            return BadRequest(new { message = "No active timer running" });

        var endTime = DateTime.UtcNow;
        var durationMinutes = (endTime - active.StartTime).TotalMinutes;
        var durationHours = Math.Round((decimal)(durationMinutes / 60.0), 4);
        if (durationHours <= 0) durationHours = 0.01m;

        var entry = new TimeEntry
        {
            UserId = userId,
            ClientId = active.ClientId,
            ProjectId = active.ProjectId,
            TaskName = string.IsNullOrWhiteSpace(active.TaskName) ? "Unspecified Task" : active.TaskName,
            StartTime = active.StartTime,
            EndTime = endTime,
            DurationHours = durationHours,
            IsBillable = active.IsBillable,
            RawNotes = active.Notes,
            AiSummary = active.Notes != null ? $"• {active.Notes}" : null,
            Status = "Unbilled"
        };

        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        await _redisTimer.ClearActiveTimerAsync(userId);

        return Ok(new { message = "Timer stopped and logged", entry });
    }
}
