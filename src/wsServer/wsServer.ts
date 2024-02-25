import 'dotenv/config';
import WebSocket from 'ws';

//const port = process.env['WS_PORT'];
const WS_PORT = 3000

const wss = new WebSocket.Server({ port: WS_PORT });

export default wss;