import 'dotenv/config';
import WebSocket from 'ws';
import { parseMessage, sendMessage } from '../helpers/message';
import { interval } from '../helpers/timer';
import { IAttackResponse, IShip, IUser, MessageType, WS } from '../helpers/types';
import { heartbeat } from '../helpers/isAlive';
import storage from '../helpers/storage';
import { registerUser } from '../helpers/commands/reg';
import { createRoom } from '../helpers/commands/createRoom';
import { addUserToRoom } from '../helpers/commands/addUserToRoom';
import { addShips } from '../helpers/commands/addShips';
import { playersAttack } from '../helpers/commands/playerAttack';
import { win } from '../helpers/commands/win';
import { clearSession } from '../helpers/clearSession';

const WS_PORT = Number(process.env.PORT);

const wss = new WebSocket.Server({ port: WS_PORT});

wss.on("connection", (ws: WS) => {

    console.log("New client connected!")
    ws.isAlive = true;
    ws.on("error", console.error);
    ws.on("pong", () => heartbeat(ws));
  
    ws.on("message", (data) => {
      const message = parseMessage(data);
      console.log(JSON.stringify(message));
  
      try {
        if (message.type === MessageType.reg) {
          const { user, response } = registerUser(message.data as IUser);
  
          if (!response.error) {
            ws.user = user as IUser;
          }
  
          sendMessage(ws, MessageType.reg, response);
          sendMessage(ws, MessageType.update_room, storage.rooms);
          sendMessage(ws, MessageType.update_winners, storage.winners);
        }

        if (message.type === MessageType.create_room) {
            createRoom(ws.user.name, ws.user.userId!);
            wss.clients.forEach((client) => {
              sendMessage(client as WS, MessageType.update_room, storage.rooms);
            });
          }
  
        if (message.type === MessageType.add_user_to_room) {
            const { indexRoom } = message.data as { indexRoom: number };
            const { gameId, gameUserIds } = addUserToRoom(indexRoom, ws.user.userId!);
    
            wss.clients.forEach((client) => {
              const player = client as WS;
              if (!gameUserIds.some((id) => id === player.user.userId)) {
                return;
              }
              sendMessage(player, MessageType.create_game, {
                idGame: gameId,
                idPlayer: gameUserIds.find((id) => id !== ws.user.userId!),
              });
              sendMessage(player, MessageType.update_room, storage.rooms);
            });
        }

        if (message.type === MessageType.add_ships) {
            const { gameId, ships } = message.data as {
              gameId: number;
              indexPlayer: number;
              ships: IShip[];
            };
            const game = addShips(gameId, ws.user.userId!, ships);
    
            if (game.boards.length !== 2) {
              // wait for the second player ships
              return;
            }
            wss.clients.forEach((client) => {
              const player = client as WS;
              const playerId = player.user.userId;
              const playerBoard = game.boards.find(
                ({ userId }) => userId === playerId
              );
              if (!playerBoard) {
                return;
              }
              sendMessage(player, MessageType.start_game, {
                ships: playerBoard.ships,
                currentPlayerIndex: ws.user.userId === playerId ? 0 : 1,
              });
    
              game.turnId = game.gameUserIds[0];
              if (playerId !== game.turnId) {
                return;
              }
              sendMessage(player, MessageType.turn, {
                currentPlayer: playerId,
              });
            });
          }

        if (message.type === MessageType.attack) {
            const currentPlayerId = ws.user.userId;
            const currentPlayerName = ws.user.name;
            const { gameId, x, y, indexPlayer } = message.data as {
              gameId: number;
              x: number;
              y: number;
              indexPlayer: number;
            };
            console.log({
              attacker: currentPlayerName,
              indexPlayer,
              users: storage.users,
            });
    
            const { game, finish, enemyId, attacks } = playersAttack(
              gameId,
              currentPlayerId,
              x,
              y
            );
    
            wss.clients.forEach((client) => {
              const ws = client as WS;
              if (
                ws.user.userId !== currentPlayerId &&
                ws.user.userId !== enemyId
              ) {
                return;
              }
              attacks.forEach((a) => {
                const attack: IAttackResponse & { currentPlayer: 0 | 1 } = {
                  ...a,
                  currentPlayer: ws.user.userId === currentPlayerId ? 0 : 1,
                };
                sendMessage(ws, MessageType.attack, attack);
              });
              if (finish) {
                win(currentPlayerName);
                sendMessage(ws, MessageType.finish, {
                  winPlayer: ws.user.userId === currentPlayerId ? 0 : 1,
                });
                return;
              }
              console.log({ turnId: game.turnId });
    
              sendMessage(ws, MessageType.turn, {
                currentPlayer: ws.user.userId === game.turnId ? 0 : 1,
              });
            });
        }

        if (message.type === MessageType.randomAttack) {
            const currentPlayerId = ws.user.userId;
            const currentPlayerName = ws.user.name;
            const { gameId, indexPlayer } = message.data as {
              gameId: number;
              indexPlayer: number;
            };
            const { game, finish, enemyId, attacks } = playersAttack(
              gameId,
              currentPlayerId,
              Math.round(Math.random() * 10),
              Math.round(Math.random() * 10)
            );
    
            wss.clients.forEach((client) => {
              const ws = client as WS;
              if (
                ws.user.userId !== currentPlayerId &&
                ws.user.userId !== enemyId
              ) {
                return;
              }
              attacks.forEach((a) => {
                const attack: IAttackResponse & { currentPlayer: 0 | 1 } = {
                  ...a,
                  currentPlayer: ws.user.userId === currentPlayerId ? 0 : 1,
                };
                sendMessage(ws, MessageType.attack, attack);
              });
              if (finish) {
                win(currentPlayerName);
                sendMessage(ws, MessageType.finish, {
                  winPlayer: ws.user.userId === currentPlayerId ? 0 : 1,
                });
                sendMessage(ws, MessageType.update_winners, storage.winners);
                return;
              }
    
              sendMessage(ws, MessageType.turn, {
                currentPlayer: ws.user.userId === game.turnId ? 0 : 1,
              });
            });
          }
        
      } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = error;
        }
        console.error(errorMessage);
      }
});
  
ws.on("close", (code, reason) => {
    const userId = ws.user?.userId;
    if (userId === undefined) {
      return;
    }

    clearSession(userId);
    console.log("Finish!")
  });
});

  wss.on("close", function close() {
    clearInterval(interval);
    console.log("Finish!")
  });

  
export default wss;
