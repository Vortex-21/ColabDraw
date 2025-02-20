// "use client";
// import React, { useContext, useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { ToastContainer } from "react-toastify";
// import { initDraw } from "../../draw";
// import { notify } from "../../utils";
// import { ErrorPage } from "./error";
// import { checkCookies } from "../utils/cookie-check";
// import { globalContext, GlobalContextProvider } from "../context/GlobalContext";
// // import { useGlobalContext } from "../context/useGlobalContext";
// enum Shapes {
//   rectangle = "rectangle",
//   circle = "ellipse",
// }

// export const Canvas = ({ roomId, ws }: { roomId: number; ws: WebSocket }) => {
//   // const windowSize = useWindowSize();
//   // console.log("windowSize : ", windowSize); 
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const overlayCanvasRef= useRef<HTMLCanvasElement | null>(null);
//   // const [selectedShape, setSelectedShape] = useState<Shapes>(Shapes.rectangle);
//   const context = useContext(globalContext);
//   if(!context)return; 
//   const {tool, setTool} =context;  
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
//   const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

//   useEffect(() => {
//     if (!canvasSize) {
//       setCanvasSize({
//         width: window.innerWidth, 
//         height: window.innerHeight
//       });
//     }
//   }, [canvasSize]);

//   // useEffect(() => {
//   //   if (canvasRef.current && overlayCanvasRef.current) {
//   //     const canvas = canvasRef.current;
//   //     const ctx = canvas.getContext("2d");
//   //     const overlayCanvas = overlayCanvasRef.current; 
//   //     if (!ctx || !roomId ||!overlayCanvas) return;

//   //     ctx.fillStyle = "rgba(0,0,0)";
//   //     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   //     initDraw(roomId, canvas, overlayCanvas, selectedShape, ws);
//   //   }
//   // }, [selectedShape]);

//   useEffect(() => {

//     checkCookies(setIsAuthenticated);

//     if (canvasRef.current) {
//       const canvas = canvasRef.current;
//       const overlayCanvas = overlayCanvasRef.current;
//       const ctx = canvas.getContext("2d");
//       if (!ctx || !roomId || !overlayCanvas) return;
//       // if (!roomId) return;

//       ctx.fillStyle = "rgba(0,0,0)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       initDraw(roomId, canvas, overlayCanvas, ws);
//     }
//     // console.log("Dimensions : ", windowSize.width, windowSize.height);
//   }, [canvasRef]);

//   async function shareHandler() {
//     const response = await axios.post(
//       `http://localhost:3002/api/v1/share-room/`,
//       { roomId: Number(roomId) },
//       { withCredentials: true }
//     );
//     console.log(response.data.shareId);
//     window.navigator.clipboard.writeText(response.data.shareId);
//     notify("ShareId copied to clipboard!", true);
//   }

  

//   return isAuthenticated ? (
//     <div className="flex  justify-center items-center gap-1p-2">
//       <ToastContainer />
//       <nav className="rounded-lg py-2 px-4 w-[30%] bg-white z-20 absolute top-5 left-[50%] translate-x-[-50%]">
//         <div className="flex items-center justify-evenly">
//           <div
//             className={`${tool === Shapes.rectangle ? "bg-white" : ""} border rounded-lg py-2 px-4`}
//             onClick={(e) => {
//               setTool(Shapes.rectangle);
//             }}
//           >
//             rectangle
//           </div>

//           <div
//             className={`${tool === Shapes.circle ? "bg-white" : ""} border rounded-lg py-2 px-4`}
//             onClick={(e) => {
//               setTool(Shapes.circle);
//             }}
//           >
//             circle
//           </div>
//           <div onClick={shareHandler} className='border'>Share</div>
//           {/* <button onClick={startSessionHandler}>Start Session</button> */}
//         </div>
//       </nav>
//       <div className="w-full min-h-screen">
//         <canvas
//           className="cursor-crosshair bg-black touch-none"
//           ref={canvasRef}
//           width={canvasSize?.width}
//           height={canvasSize?.height}
//           id="drawingCanvas"
//         ></canvas>
//         <canvas
//           className="cursor-crosshair absolute  top-0 left-0 z-10 touch-none"
//           ref={overlayCanvasRef}
//           width={canvasSize?.width}
//           height={canvasSize?.height}
//           id="overlayCanvas"
          
//         ></canvas>
//       </div>
//     </div>
//   ) : (
//     <ErrorPage />
//   );
// };
// export default Canvas;



import React, { MouseEventHandler, useEffect, useRef, useState } from 'react'
interface shapeMetaData { 
  x:number; 
  y:number; 
  width:number; 
  height:number;
}
const Canvas = ({roomId, ws}:{roomId:number, ws:WebSocket}) => {
  
  
  
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null); 
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null); 
  
  
  const [canvasSize, setCanvasSize] = useState<{width:number, height:number}|null>(null)
  const [isDrawing, setIsDrawing] = useState(false); 
  const [drawStartCoords, setDrawStartCoords] = useState({x:0, y:0}); 
  const [tool, setTool] = useState('draw'); 
  const [dimensions, setDimensions] = useState({width:0, height:0}); 
  const [hist, setHist] = useState<Array<shapeMetaData>>([]); 
  // const [panStartCoords, setPanStartCoords] = useState({x:0, y:0}); 
  
  useEffect(() => {
    if(!canvasSize) {
      setCanvasSize({
        width: window.innerWidth, 
        height: window.innerHeight
      })
    }
  }, [canvasSize]); 

  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current; 
    if(!overlayCanvas)return; 
    const overlayCtx = overlayCanvas.getContext('2d'); 
    if(!overlayCtx)return; 

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.strokeStyle='red'; 
    overlayCtx.lineWidth=2;
    overlayCtx.beginPath();
    hist.forEach((el: shapeMetaData) => {
      overlayCtx.rect(el.x, el.y, el.width, el.height);
      overlayCtx.stroke();
    })  
    //log the dimensions of the rectangle in the console 
    console.log('Dimensions : ', dimensions.width, dimensions.height);
    overlayCtx.rect(drawStartCoords.x, drawStartCoords.y, dimensions.width, dimensions.height);
    overlayCtx.stroke(); 
    overlayCtx.closePath(); 

    
  }, [dimensions])



  function getCurrMouseCoords(e:any){ 
    return {x:e.clientX, y:e.clientY}; 
  }
  
  function mouseDownHandler(e:any) {
    // e.preventDefault();
    console.log('mouse down')
    const curr = getCurrMouseCoords(e);
    if(tool === 'draw'){
      setIsDrawing(true); 
      setDrawStartCoords(curr);
    }
    else{ 
      
    }

  }

  function mouseMoveHandler(e:any) {
    // e.preventDefault();
    console.log('mouse move')
    if(isDrawing){ 
      const curr = getCurrMouseCoords(e);
      let width = curr.x - drawStartCoords.x;
      let height = curr.y - drawStartCoords.y;

      if(width && height){ 
        //provide the animation on the overlay canvas. 
        setDimensions({width, height}); 
      }
    }
    else{ 

    }
  }

  function mouseUpHandler(e:any) {
    // e.preventDefault();
    if(isDrawing){ 
      setIsDrawing(false); 
      const mainCanvas = mainCanvasRef.current; 
      if(!mainCanvas)return;
      const mainCtx = mainCanvas.getContext('2d'); 
      if(!mainCtx)return; 

      mainCtx.strokeStyle='red';
      mainCtx.lineWidth=2;
      mainCtx.rect(drawStartCoords.x, drawStartCoords.y, dimensions.width, dimensions.height);
      mainCtx.stroke();
      setHist((prev) => {
        return [...prev, {x:drawStartCoords.x, y:drawStartCoords.y, width:dimensions.width, height:dimensions.height}];  //store the shape in the history array.
      })
    }
  }
  
  function mouseWheelHandler(e:any) {
    // e.preventDefault();
    console.log('mouse wheel')
  }
  
  
  
  
  

  function changeToolHandler(e:any) {
    // e.preventDefault();
    console.log('change tool')
    setTool(e.target.id);
  }



  return (
    <div className='w-screen h-screen'>
      <nav className='flex justify-center items-center gap-4 px-4 py-2 rounded-lg z-20 bg-white text-black  absolute top-5 left-[50%] translate-x-[-50%]'>
        <label htmlFor="draw" className={`border rounded-md px-4 py-2 ${tool === 'draw' ? 'bg-gray-500':'bg-white'}`}>Draw</label>
        <input onChange={changeToolHandler} className = 'sr-only' type='radio' id='draw' name = 'tool'/>
        
        
        
        <label htmlFor="pointer" className={`border rounded-md px-4 py-2 ${tool === 'pointer' ? 'bg-gray-500':'bg-white'}`}>Pointer</label>
        <input onChange={changeToolHandler} className='sr-only' type="radio" id='pointer'  name = 'tool'/>
      </nav>
      <canvas
      id='overlay'
      ref= {overlayCanvasRef}
      className='z-10 bg-black absolute top-0 left-0'
      onMouseDown={mouseDownHandler} 
      onMouseMove={mouseMoveHandler} 
      onMouseUp={mouseUpHandler}
      onWheel={mouseWheelHandler}
      width={canvasSize?.width}
      height={canvasSize?.height}>
        
      </canvas>
      <canvas
      id='main'
      ref={mainCanvasRef}
      className='bg-black touch-none'
      onMouseDown={mouseDownHandler} 
      onMouseMove={mouseMoveHandler} 
      onMouseUp={mouseUpHandler}
      onWheel={mouseWheelHandler}
      width={canvasSize?.width}
      height={canvasSize?.height}
      ></canvas>
    </div>
  )
}

export default Canvas
