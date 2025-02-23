import { WebSocketServer, WebSocket } from "ws";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { Queue } from "bullmq";
import prisma  from "@repo/Database/prismaClient";

const wss = new WebSocketServer({port:3001}); 
function checkUser(token: string): string|null { 
    try{
        const decodedToken  = jwt.verify(token, JWT_SECRET);
        if(typeof(decodedToken) === "string"){
            return null;
        } 
        if(!decodedToken || !decodedToken.userId){ 
            throw JsonWebTokenError
        }
        return decodedToken.userId;
    }
    catch(err){
        console.log("Token verification failed: ", err); 
        return null;
    }
}

 
let roomToSocket = new Map<number,Map<WebSocket,boolean>>(); 
let dbInsertionQueue = new Queue('dbInsertionQueue'); 

async function addMessageToDB(roomId:number, userId:string, startX:number, startY:number, width:number, height:number, shape:string){ 
    try { 
        await dbInsertionQueue.add('dbInsertionQueue',{ 
                roomId,
                startX,
                startY,
                width,
                height,
                shape,
                userId
            
        }, { 
            attempts:2
        }); 
        console.log("Added to Queue!");
    } catch (error) { 
        console.log("Error adding message to DB: ", error); 
    }
}


wss.on('connection', (socket, request)   => {
    console.log("User connected!"); 
    console.log(JSON.stringify(roomToSocket));
    const data = (request.url)?.split('?')[1]; 
    console.log('URL: ', request.url);
    console.log("Data: " + data); 
    if(!data){ 
        console.log('closing because user jwt not provided in url');
        socket.close(); 
        return;    
    }
    const urlData = new URLSearchParams(data);
    
    const token = urlData.get("token")??""; 
               
    const userId = checkUser(token); 
    console.log(userId); 
    if(!userId){ 
        console.log('closing connection')
        socket.close(); 
        return; 
    }

    
    socket.on('message', async(message) => {
        try{
            const parsedMessage = JSON.parse(message.toString());
            if (!parsedMessage || !parsedMessage.type || !parsedMessage.payload) {
                socket.send("Invalid message format");
                return;
            }
           
            else if(parsedMessage.type === "join"){ 
                const roomId = parsedMessage.payload.roomId; 
                console.log(roomId); 
                let socketMap = roomToSocket.get(roomId); 
                const room = await prisma.room.findFirst({where:{id:roomId}}); 
                if(!room){ 
                    socket.send("Room doesnt exist! Please create a room first!");
                    socket.close();  
                    return;
                }
                if(!socketMap) // room doesnt exist!
                { 
                    socketMap = new Map<WebSocket,boolean>();  
                    // return;
                }
    
                socketMap.set(socket,true);
                
                roomToSocket.set(roomId, socketMap); 
                console.log('user joined!'); 
                socket.send(JSON.stringify({
                    status:"success"
                }))
                
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
                // const message = parsedMessage.payload.message; 
                const shape = parsedMessage.payload.shape; 
                const startX = parsedMessage.payload.startX; 
                const startY =  parsedMessage.payload.startY; 
                const width = parsedMessage.payload.width; 
                const height = parsedMessage.payload.height;
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
                    // if(memberSocket !== socket)memberSocket.send(message); 
                    if(memberSocket!==socket)memberSocket.send(JSON.stringify({
                            type:'geo', 
                            shape, 
                            startX, 
                            startY, 
                            width, 
                            height
                        
                    }));
                }
    
                // await addMessageToDB(roomId, userId, startX, startY, width, height, shape); 
    
    
            }
            else{
                socket.send("Bad Request!"); 
                socket.close(); 
    
            }
        }
        catch(err:any){ 
            socket.send("Invalid JSON sent!"); 
            socket.close(); 
            console.log("Error : ", err); 
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
