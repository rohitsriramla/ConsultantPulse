using DevTimer.Api.Data;
using DevTimer.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTimer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly DevTimerDbContext _db;
    public ProjectsController(DevTimerDbContext db) => _db = db;

    public record CreateProjectDto(Guid ClientId, string Name, string Color, decimal BudgetHours);

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
    {
        var project = new Project
        {
            ClientId = dto.ClientId,
            Name = dto.Name,
            Color = string.IsNullOrWhiteSpace(dto.Color) ? "#3b82f6" : dto.Color,
            BudgetHours = dto.BudgetHours
        };
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return Ok(project);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Project deleted" });
    }
}
