using DevTimer.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTimer.Api.Data;

public class DevTimerDbContext : DbContext
{
    public DevTimerDbContext(DbContextOptions<DevTimerDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<Client>().ToTable("clients");
        modelBuilder.Entity<Project>().ToTable("projects");
        modelBuilder.Entity<TimeEntry>().ToTable("time_entries");
        modelBuilder.Entity<Invoice>().ToTable("invoices");
    }
}
