import 'dotenv/config';
import WebSocket from 'ws';
import { parseMessage, sendMessage } from '../helpers/message';
import { interval } from '../helpers/timer';
import { IUser, MessageType, WS } from '../helpers/types';
import { heartbeat } from '../helpers/isAlive';
import storage from '../helpers/storage';
import { registerUser } from '../helpers/commands/reg';

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
