import { httpServer } from "./src/http_server/index.js";

const HTTP_PORT = 8181;

console.log(`http://localhost:${HTTP_PORT}/`);
httpServer.listen(HTTP_PORT);
