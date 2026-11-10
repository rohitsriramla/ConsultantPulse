using System.ComponentModel.DataAnnotations.Schema;

namespace DevTimer.Api.Models;

[Table("users")]
public class User
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Column("email")]
    public string Email { get; set; } = string.Empty;
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("clients")]
public class Client
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Column("user_id")]
    public Guid UserId { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("company")]
    public string Company { get; set; } = string.Empty;
    [Column("email")]
    public string? Email { get; set; }
    [Column("hourly_rate")]
    public decimal HourlyRate { get; set; } = 120.00m;
    [Column("currency")]
    public string Currency { get; set; } = "USD";
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Project> Projects { get; set; } = new();
}

[Table("projects")]
public class Project
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Column("client_id")]
    public Guid ClientId { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("color")]
    public string Color { get; set; } = "#3b82f6";
    [Column("budget_hours")]
    public decimal BudgetHours { get; set; } = 0.00m;
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("time_entries")]
public class TimeEntry
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Column("user_id")]
    public Guid UserId { get; set; }
    [Column("client_id")]
    public Guid ClientId { get; set; }
    [Column("project_id")]
    public Guid? ProjectId { get; set; }
    [Column("task_name")]
    public string TaskName { get; set; } = string.Empty;
    [Column("start_time")]
    public DateTime StartTime { get; set; }
    [Column("end_time")]
    public DateTime EndTime { get; set; }
    [Column("duration_hours")]
    public decimal DurationHours { get; set; }
    [Column("is_billable")]
    public bool IsBillable { get; set; } = true;
    [Column("raw_notes")]
    public string? RawNotes { get; set; }
    [Column("ai_summary")]
    public string? AiSummary { get; set; }
    [Column("status")]
    public string Status { get; set; } = "Unbilled";
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("invoices")]
public class Invoice
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Column("client_id")]
    public Guid ClientId { get; set; }
    [Column("invoice_number")]
    public string InvoiceNumber { get; set; } = string.Empty;
    [Column("total_amount")]
    public decimal TotalAmount { get; set; }
    [Column("hours_total")]
    public decimal HoursTotal { get; set; }
    [Column("pdf_path")]
    public string? PdfPath { get; set; }
    [Column("status")]
    public string Status { get; set; } = "Draft";
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
