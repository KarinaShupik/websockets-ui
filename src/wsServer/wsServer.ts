import 'dotenv/config';
import WebSocket from 'ws';
import { parseMessage, sendMessage } from '../helpers/message';
import { interval } from '../helpers/timer';
import { IShip, IUser, MessageType, WS } from '../helpers/types';
import { heartbeat } from '../helpers/isAlive';
import storage from '../helpers/storage';
import { registerUser } from '../helpers/commands/reg';
import { createRoom } from '../helpers/commands/createRoom';
import { addUserToRoom } from '../helpers/commands/addUserToRoom';
import { addShips } from '../helpers/commands/addShips';

//const port = process.env['WS_PORT'];
const WS_PORT = 3000

const wss = new WebSocket.Server({ port: WS_PORT });

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
  
  wss.on("close", function close() {
    clearInterval(interval);
    console.log("Finish!")
  });
})
  
export default wss;
