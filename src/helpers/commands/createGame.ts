import storage from "../storage";
import { IGame } from "../types";

export const createGame = (userId1: number, userId2: number): IGame => {
    const existingGame = storage.games.find(
      (g) =>
        g.gameUserIds.length === 2 &&
        g.gameUserIds.every((id) => id === userId1 || id === userId2)
    );
    if (existingGame) {
      throw new Error("The game with these two users already exists");
    }
  
    const game: IGame = {
      gameId: storage.gameId,
      gameUserIds: [userId1, userId2],
      turnId: userId1,
      boards: [],
    };
    storage.gameId++;
    storage.games.push(game);
    return game;
  };