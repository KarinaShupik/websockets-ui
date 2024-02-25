import { httpServer } from "./http_server/index";
import  wss  from './wsServer/wsServer';

const HTTP_PORT = 8181;

console.log(`http://localhost:${HTTP_PORT}/`);
httpServer.listen(HTTP_PORT);

httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});