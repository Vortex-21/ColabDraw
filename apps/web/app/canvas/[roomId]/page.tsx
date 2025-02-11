// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { initDraw } from "../../../draw/index";
// import { useParams } from "next/navigation";
// import Cookies from "js-cookie";
// import { ErrorPage } from "../../components/error";
// import axios from "axios";
// import { notify } from "../../../utils";
// import { ToastContainer } from "react-toastify";
import PreCanvas from "../../components/PreCanvas";
// enum Shapes {
//   rect = "rectangle",
//   circle = "circle",
// }

// export const CanvasPage = () => {
//   const { roomId } = useParams();
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [selectedShape, setSelectedShape] = useState<Shapes>(Shapes.rect);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
//   useEffect(() =>{ 
//     if (canvasRef.current) {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       if (!ctx || !roomId || typeof roomId !== "string") return;

//       ctx.fillStyle = "rgba(0,0,0)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       initDraw(roomId, canvas, selectedShape);
//       console.log('called 1')
//     }

//   }, [selectedShape])
//   useEffect(() => {
//   // const ws = new WebSocket("ws://localhost:3001");

//     console.log('called-2')
//     // const prevData =  getPrevData(); 
//     function checkCookies() {
//       const tokenValue = Cookies.get("token");
//       console.log("value: ", tokenValue);
//       if (!tokenValue) {
//         setIsAuthenticated(false);
//       }
//     }
//     checkCookies();
//     if (canvasRef.current) {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       if (!ctx ) return;

//       ctx.fillStyle = "rgba(0,0,0)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       async function getPrevData(){ 
//         if(!roomId || typeof roomId !== "string")return; 
//         const response = await axios.get(`http://localhost:3002/api/v1/geometryHistory/${roomId}`, {withCredentials:true}); 
//         // return response.data.history; 
//         initDraw(roomId, canvas, selectedShape, response.data.history);
//       } 
//       getPrevData();
//     }
//   }, [canvasRef]);
//   async function shareHandler(){ 
//     const response = await axios.post(`http://localhost:3002/api/v1/share-room/`,{roomId:Number(roomId)} ,{withCredentials:true});
//     console.log(response.data.shareId);
//     window.navigator.clipboard.writeText(response.data.shareId); 
//     notify('ShareId copied to clipboard!',true); 
//   }
//   return isAuthenticated ? (
//     <div className="flex flex-col justify-center items-center gap-1p-2">
//       <ToastContainer/>
//       <nav className="w-full bg-red-900">
//         <div >
//           <div
//             className={`${selectedShape === Shapes.rect ? "bg-white" : ""}`}
//             onClick={(e) => {
//               setSelectedShape(Shapes.rect);
//             }}
//           >
//             rectangle
//           </div>

//           <div
//             className={`${selectedShape === Shapes.circle ? "bg-white" : ""}`}
//             onClick={(e) => {
//               setSelectedShape(Shapes.circle);
//             }}
//           >
//             circle
//           </div>
//           <div onClick={shareHandler}>
//             Share
//           </div>
//         </div>
//       </nav>
//       <div className="w-full min-h-screen">
//         <canvas
//           className="cursor-crosshair"
//           ref={canvasRef}
//           width={window.innerWidth}
//           height={window.innerHeight}
//           id="drawingCanvas"
//         ></canvas>
//       </div>
//     </div>
//   ) : (
//     <ErrorPage />
//   );
// };
function CanvasPage(){ 
  return <PreCanvas/>
}

export default CanvasPage;
