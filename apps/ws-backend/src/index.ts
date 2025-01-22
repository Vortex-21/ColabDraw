import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:3001}); 
wss.on('connection', (socket) => {
    console.log("User connected!"); 
})
