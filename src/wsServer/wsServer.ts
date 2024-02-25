import 'dotenv/config';
import WebSocket from 'ws';
import { parseMessage } from '../helpers/message';
import { interval } from '../helpers/timer';
import { WS } from '../helpers/types';
import { heartbeat } from '../helpers/isAlive';

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
  
      
  
    
  });
  
  wss.on("close", function close() {
    clearInterval(interval);
    console.log("Finish!")
  });
})
  
export default wss;