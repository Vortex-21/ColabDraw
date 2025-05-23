"use client";
import React, { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import { useParams } from "next/navigation";
import Cookies from 'js-cookie'
const PreCanvas = () => {
    const {roomId}=useParams(); 
    if(!roomId || typeof(roomId)!='string'){
        return;
    }
    const [isConnected,setIsConnected] = useState<boolean>(false); 
    const wsRef = useRef<WebSocket | null>(null); 
    
    useEffect(() => {
        const websocketURL = `${process.env.NEXT_PUBLIC_WS_BASE}/?token=`+Cookies.get('token'); 
        const conn = new WebSocket(websocketURL); 
        conn.onmessage = (event) => { 
            const parsedMessage = JSON.parse(event.data.toString()); 
            if(parsedMessage.status === 'success'){ 
                setIsConnected(true);
            }
        }
        conn.onopen = () =>{
            wsRef.current = conn; 
            // setIsConnected(true); 
            conn.send(JSON.stringify({ 
                type:'join', 
                payload:{
                    'roomId':Number(roomId), 
                }
            })); 
            
        }

        return () => { 
            wsRef.current?.close(); 
            wsRef.current=null; 
            setIsConnected(false);
        }

    }, []);
    return (isConnected&&wsRef.current)?<Canvas roomId={Number(roomId)} ws={wsRef.current}/>:<div>Establishing connection...</div>;
};

export default PreCanvas;
