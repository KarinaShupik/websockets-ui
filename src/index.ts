import { httpServer } from "./http_server/index";

const HTTP_PORT = 8181;

console.log(`http://localhost:${HTTP_PORT}/`);
httpServer.listen(HTTP_PORT);

