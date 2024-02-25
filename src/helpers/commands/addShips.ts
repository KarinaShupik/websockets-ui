import storage from "../storage";
import { IBoard, IGame, IShip } from "../types";

export const addShips = (gameId: number, userId: number, ships: IShip[]): IGame => {
    const game = storage.games.find(
      (g) =>
        g.gameUserIds.length === 2 && g.gameUserIds.some((id) => id === userId)
    );
    if (!game) {
      throw new Error(`The game ${gameId} with user ${userId} doesn't exist`);
    }
    if (game.boards.length === 2) {
      throw new Error("Both players have provided their ships already");
    }
  
    ships.map((s) => {
      s.health = s.length;
      s.killed = false;
    });
  
    const board: IBoard = {
      gameId,
      userId,
      ships: ships.map((pos) => ({ ...pos })),
      attacks: [],
    };
    game.boards.push(board);
  
    return game;
  };