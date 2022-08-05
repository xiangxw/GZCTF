﻿using CTFServer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace CTFServer.Repositories;

public class GameEventRepository : RepositoryBase, IGameEventRepository
{
    public GameEventRepository(AppDbContext _context) : base(_context)
    {
    }

    public async Task<GameEvent> AddEvent(Game game, GameEvent gameEvent, CancellationToken token = default)
    {
        gameEvent.Game = game;

        await context.AddAsync(gameEvent);
        await context.SaveChangesAsync(token);

        // TODO: send to signalR (for monitor)

        return gameEvent;
    }

    public Task<GameEvent[]> GetEvents(int gameId, int count = 10, int skip = 0, CancellationToken token = default)
        => context.GameEvents.Where(e => e.GameId == gameId)
            .OrderByDescending(e => e.PublishTimeUTC).Skip(skip).Take(count).ToArrayAsync(token);
}