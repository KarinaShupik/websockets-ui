import wss from '../wsServer/wsServer';
import {WS} from "./types";
import { clearSession } from './clearSession';

export const interval = setInterval(function ping() {
    wss.clients.forEach(function each(client) {
      const ws: WS = client as WS;
      if (ws.isAlive === false) {
        clearSession;
        ws.terminate();
        const userId = ws.user?.userId;
        if (userId === undefined) {
          return;
        }
        clearSession(userId);
        return;
      }
  
      ws.isAlive = false;
      ws.ping();
    });
  }, 3000);