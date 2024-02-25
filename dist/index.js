"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./http_server/index");
var wsServer_1 = __importDefault(require("./wsServer/wsServer"));
var HTTP_PORT = 8181;
console.log("http://localhost:".concat(HTTP_PORT));
index_1.httpServer.listen(HTTP_PORT);
index_1.httpServer.on('upgrade', function (request, socket, head) {
    wsServer_1.default.handleUpgrade(request, socket, head, function (ws) {
        wsServer_1.default.emit('connection', ws, request);
    });
});
