import {WS} from "./types";

export const heartbeat = (ws: WS) => {
    ws.isAlive = true;
};