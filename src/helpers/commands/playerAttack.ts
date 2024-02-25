import storage from "../storage";
import { IAttackResponse, IBoard, IGame, IShip } from "../types";

export const playersAttack = (
  gameId: number,
  userId: number,
  x: number,
  y: number
): {
  game: IGame;
  finish: boolean;
  enemyId: number;
  attacks: IAttackResponse[];
} => {
  const game = storage.games.find((g) => g.gameId === gameId);
  if (!game) {
    throw new Error(`The game ${gameId} doesn't exist`);
  }
  const board = game.boards.find((b) => b.userId === userId);
  if (!board) {
    throw new Error(`The user ${userId} doesn't exist in the game ${gameId}`);
  }
  if (game.turnId !== userId) {
    throw new Error(
      `The user ${userId} should't attack when turn user ${game.turnId}`
    );
  }
  const enemyBoard = game.boards.find((b) => b.userId !== userId);
  if (!enemyBoard) {
    throw new Error(`The enemy's board doesn't exist in the game ${gameId}`);
  }
  const result: IAttackResponse[] = [];

  const existingAttack = board.attacks.find(
    (a) => a.position.x === x && a.position.y === y
  );
  const ship = enemyBoard.ships.find((s) => {
    const x1 = s.position.x;
    const x2 = x1 + (!s.direction ? s.length - 1 : 0);
    const y1 = s.position.y;
    const y2 = y1 + (s.direction ? s.length - 1 : 0);
    return x1 <= x && x <= x2 && y1 <= y && y <= y2;
  });
  const enemyId = enemyBoard.userId;
  let turn = false;
  let finish = false;
  if (!existingAttack && ship) {
    turn = true;
    ship.health--;
    if (!ship.health) {
      ship.killed = true;
      for (let i = 0; i < ship.length; i++) {
        const x = ship.direction ? ship.position.x : ship.position.x + i;
        const y = !ship.direction ? ship.position.y : ship.position.y + i;
        const attack: IAttackResponse = {
          status: "killed",
          position: { x, y },
        };
        result.push(attack);
      }
      for (let xn = -1; xn < (ship.direction ? 1 : ship.length) + 1; xn++) {
        for (let yn = -1; yn < (!ship.direction ? 1 : ship.length) + 1; yn++) {
          const x = ship.position.x + xn;
          const y = ship.position.y + yn;
          if (x < 0 || x > 9 || y < 0 || y > 9) continue;

          const attack: IAttackResponse = {
            status: "miss",
            position: { x, y },
          };
          result.push(attack);
        }
      }
    } else {
      const attack: IAttackResponse = {
        status: "shot",
        position: { x, y },
      };
      result.push(attack);
    }
    finish = enemyBoard.ships.every((ship) => ship.killed);
    if (finish) {
      storage.games = storage.games.filter((g) => g.gameId !== gameId);
    }
  } else {
    const attack: IAttackResponse = {
      status: "miss",
      position: { x, y },
    };
    result.push(attack);
  }
  board.attacks.push(...result);
  const turnId = game.gameUserIds.find((id) =>
    turn ? id === userId : id !== userId
  )!;
  game.turnId = turnId;

  return { game, finish, enemyId, attacks: result };
};