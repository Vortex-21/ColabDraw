import { WebSocketServer } from "ws";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { JwtPayload } from "jsonwebtoken";
const wss = new WebSocketServer({port:3001}); 
// import { JWT_SECRET } from "./config";
import { JWT_SECRET } from "@repo/backend-common/config";

wss.on('connection', (socket, request)   => {
    console.log("User connected!"); 
    const data = (request.url)?.split('?')[1]; 

    const urlData = new URLSearchParams(data);
    
    const token = urlData.get("token")??""; 

    try{
        const decodedToken  = jwt.verify(token, JWT_SECRET);
        if(typeof(decodedToken) === "string"){
            socket.close(); 
            return;
        } 
        if(!decodedToken || !decodedToken.username){ 
            throw JsonWebTokenError
        }
        socket.send("Hello!")
    }
    catch(err){
        console.log("Error: ", err); 
        socket.close(); 
    }
   
    
})
