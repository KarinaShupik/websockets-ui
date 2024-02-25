import storage from './storage'

export const clearSession = (userId: number) => {
    storage.rooms = storage.rooms.filter(
      (r) => !r.roomUsers.some((u) => u.userId === userId)
    );
    storage.games = storage.games.filter(
      (g) => !g.gameUserIds.some((id) => id === userId)
    );
  };