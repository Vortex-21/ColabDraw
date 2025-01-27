import { WebSocketServer, WebSocket } from "ws";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({port:3001}); 
function checkUser(token: string): string|null { 
    try{
        const decodedToken  = jwt.verify(token, JWT_SECRET);
        if(typeof(decodedToken) === "string"){
            return null;
        } 
        if(!decodedToken || !decodedToken.username){ 
            throw JsonWebTokenError
        }
        return decodedToken.username;
    }
    catch(err){
        console.log("Token verification failed: ", err); 
        return null;
    }
}

 
let roomToSocket = new Map<number,Map<WebSocket,boolean>>(); 


wss.on('connection', (socket, request)   => {
    console.log("User connected!"); 
    const data = (request.url)?.split('?')[1]; 
    if(!data){ 
        socket.close(); 
        return;    
    }
    const urlData = new URLSearchParams(data);
    
    const token = urlData.get("token")??""; 
               
    const username = checkUser(token); 
    if(!username){ 
        socket.close(); 
        return; 
    }

    
    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString());
        if (!parsedMessage || !parsedMessage.type || !parsedMessage.payload) {
            socket.send("Invalid message format");
            return;
        }
        if(parsedMessage.type === "create"){ 
            const roomId = parsedMessage.payload.roomId; 
            
            if(roomToSocket.has(roomId)){ 
                socket.send("Room already exists!"); 
                return;
            } 
            const socketMap = new Map<WebSocket,boolean>();
            socketMap.set(socket,true);  
            roomToSocket.set(roomId, socketMap); 
            socket.send("Room created successfully!"); 
        } 
        else if(parsedMessage.type === "join"){ 
            const roomId = parsedMessage.payload.roomId; 
            
            const socketMap = roomToSocket.get(roomId); 
            if(!socketMap) // room doesnt exist!
            { 
                socket.send("Room doesnt exist!");
                return;
            }

            socketMap.set(socket,true);
            
            roomToSocket.set(roomId, socketMap); 
            
        }
        else if(parsedMessage.type === "leave"){ 
            const roomId = parsedMessage.payload.roomId; 

            const socketMap = roomToSocket.get(roomId); 
            if(!socketMap){ 
                socket.send("Room doesnt exist!"); 
                return; 
            }

            socketMap.delete(socket); 
            if(socketMap.size == 0){ 
                roomToSocket.delete(roomId); 
            }
            socket.send("You are no longer a participant of this room!"); 

        }
        else if(parsedMessage.type === "chat"){ 
            const message = parsedMessage.payload.message; 
            const roomId = parsedMessage.payload.roomId; 

            const socketMap = roomToSocket.get(roomId); 
            if(!socketMap){ 
                socket.send("Room is empty!"); 
                return;
            }
            if(!socketMap.has(socket)){
                socket.send("You are not a participant of the current room. Join room first!");
                return;
            }
            for(const [memberSocket, isPresent] of socketMap){ 
                if(memberSocket !== socket)memberSocket.send(message); 
            }
        }
        else{
            socket.send("Bad Request!"); 
            socket.close(); 

        }

    })

    socket.on('close', () => {
        for(let [roomId, socketMap] of roomToSocket){ 
            socketMap.delete(socket); 
            if(socketMap.size === 0){
                roomToSocket.delete(roomId); 
            }
        }
        console.log("Disconnection Handled!")
    });
    
   
    
})
