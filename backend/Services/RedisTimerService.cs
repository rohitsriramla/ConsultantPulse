using System.Text.Json;
using StackExchange.Redis;

namespace DevTimer.Api.Services;

public record ActiveTimerState(
    Guid UserId,
    Guid ClientId,
    Guid? ProjectId,
    string TaskName,
    DateTime StartTime,
    bool IsBillable,
    string? Notes
);

public interface IRedisTimerService
{
    Task SetActiveTimerAsync(Guid userId, ActiveTimerState state);
    Task<ActiveTimerState?> GetActiveTimerAsync(Guid userId);
    Task ClearActiveTimerAsync(Guid userId);
}

public class RedisTimerService : IRedisTimerService
{
    private readonly IDatabase _redis;

    public RedisTimerService(IConnectionMultiplexer multiplexer)
    {
        _redis = multiplexer.GetDatabase();
    }

    private static string Key(Guid userId) => $"active_timer:{userId}";

    public async Task SetActiveTimerAsync(Guid userId, ActiveTimerState state)
    {
        var json = JsonSerializer.Serialize(state);
        await _redis.StringSetAsync(Key(userId), json);
    }

    public async Task<ActiveTimerState?> GetActiveTimerAsync(Guid userId)
    {
        var value = await _redis.StringGetAsync(Key(userId));
        if (value.IsNullOrEmpty) return null;
        return JsonSerializer.Deserialize<ActiveTimerState>(value!);
    }

    public async Task ClearActiveTimerAsync(Guid userId)
    {
        await _redis.KeyDeleteAsync(Key(userId));
    }
}
