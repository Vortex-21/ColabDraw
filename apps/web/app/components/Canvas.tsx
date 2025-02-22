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

import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
interface shapeMetaData {
  x: number;
  y: number;
  width: number;
  height: number;
}
const Canvas = ({ roomId, ws }: { roomId: number; ws: WebSocket }) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartCoords, setDrawStartCoords] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState("draw");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hist, setHist] = useState<Array<shapeMetaData>>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartCoords, setPanStartCoords] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!canvasSize) {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, [canvasSize]);

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !mainCanvas) return;
    const overlayCtx = overlayCanvas.getContext("2d");
    const mainCtx = mainCanvas.getContext("2d");
    if (!overlayCtx || !mainCtx) return;

    const scaledHeight = mainCanvas.height * scale;
    const scaledWidth = mainCanvas.width * scale;
    setScaleOffset({ x: (scaledWidth - mainCanvas.width) / 2, y: (scaledHeight - mainCanvas.height) / 2 });
    overlayCtx.save();

    mainCtx.save();
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    overlayCtx.translate(panOffset.x*scale - ((scaledWidth-mainCanvas.width) / 2), panOffset.y*scale - ((scaledHeight-mainCanvas.height) / 2));
    mainCtx.translate(panOffset.x*scale - ((scaledWidth-mainCanvas.width) / 2), panOffset.y*scale - ((scaledHeight-mainCanvas.height) / 2));
    overlayCtx.scale(scale, scale);
    mainCtx.scale(scale, scale);
    overlayCtx.strokeStyle = "red";
    mainCtx.strokeStyle = 'blue';
    overlayCtx.lineWidth = 2;
    mainCtx.lineWidth = 2;
    hist.forEach((el: shapeMetaData) => {
      overlayCtx.beginPath();
      overlayCtx.rect(el.x, el.y, el.width, el.height);
      overlayCtx.stroke();
      overlayCtx.closePath(); 
      mainCtx.beginPath();
      mainCtx.rect(el.x, el.y, el.width, el.height);
      mainCtx.stroke();
      mainCtx.closePath(); 
    });
    //log the dimensions of the rectangle in the console
    if (isDrawing) {
      console.log("Dimensions : ", dimensions.width, dimensions.height);
      overlayCtx.beginPath();
      overlayCtx.rect(
        drawStartCoords.x,
        drawStartCoords.y,
        dimensions.width,
        dimensions.height
      );
      overlayCtx.stroke();
      overlayCtx.closePath();
    }
    overlayCtx.restore();
    mainCtx.restore();
  }, [dimensions, panOffset, scale]);
  
  
  // useEffect(() => {
  //   const overlayCanvas = overlayCanvasRef.current;
  //   const mainCanvas = mainCanvasRef.current;
  //   if(!mainCanvas || !overlayCanvas)return; 
  //   console.log('Scaling factor:  ', scale); 
    

    

  // }, [scale])
  function getCurrMouseCoords(e: any) {
    return { x: (e.clientX - panOffset.x*scale + scaleOffset.x)/scale, y: (e.clientY - panOffset.y*scale + scaleOffset.y)/scale };
  }

  function mouseDownHandler(e: any) {
    // e.preventDefault();
    console.log("mouse down");
    const curr = getCurrMouseCoords(e);
    if (tool === "draw") {
      setIsDrawing(true);
      setDrawStartCoords(curr);
    } else {
      setIsPanning(true);
      setPanStartCoords({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  }

  function mouseMoveHandler(e: any) {
    // e.preventDefault();
    console.log("mouse move");
    const curr = getCurrMouseCoords(e);
    if (isDrawing) {
      let width = curr.x - drawStartCoords.x;
      let height = curr.y - drawStartCoords.y;

      if (width && height) {
        //provide the animation on the overlay canvas.
        setDimensions({ width, height });
      }
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartCoords.x,
        y: e.clientY - panStartCoords.y,
      });
    }
  }

  function mouseUpHandler(e: any) {
    // e.preventDefault();
    const mainCanvas = mainCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mainCanvas || !overlayCanvas) return;
    const mainCtx = mainCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!mainCtx || !overlayCtx) return;
    if (isDrawing) {
      console.log("drawing done!")
      setIsDrawing(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      mainCtx.strokeStyle = "blue";
      mainCtx.lineWidth = 2;
      mainCtx.save();
      // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); //clear the main canvas.
      mainCtx.translate(panOffset.x*scale - scaleOffset.x, panOffset.y*scale-scaleOffset.y);
      mainCtx.scale(scale, scale); 
      // hist.forEach((el) => {
      //   mainCtx.beginPath();
      //   mainCtx.rect(el.x, el.y, el.width, el.height);
      //   mainCtx.stroke();
      //   mainCtx.closePath(); //end the path.
      // });
      mainCtx.beginPath(); 
      mainCtx.rect(
        drawStartCoords.x,
        drawStartCoords.y,
        dimensions.width,
        dimensions.height
      );
      mainCtx.stroke();
      mainCtx.closePath(); //end the path.
      mainCtx.restore();
      setHist((prev) => {
        return [
          ...prev,
          {
            x: drawStartCoords.x,
            y: drawStartCoords.y,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]; //store the shape in the history array.
      });
    } else{
      console.log("zoomed or panned!"); 
      setIsPanning(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); //clear the overlay canvas.
      mainCtx.save();
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.translate(panOffset.x*scale - scaleOffset.x, panOffset.y*scale - scaleOffset.y);
      mainCtx.scale(scale, scale); 
      mainCtx.strokeStyle = "blue";
      mainCtx.lineWidth = 2;
      hist.forEach((el) => {
        mainCtx.beginPath();
        mainCtx.rect(el.x, el.y, el.width, el.height);
        mainCtx.stroke();
        mainCtx.closePath(); //end the path.
      });
      mainCtx.restore();
    }
  }

  function mouseWheelHandler(e: any) {
    // e.preventDefault();
    console.log("mouse wheel");
    const zoomFactor = (e.deltaY < 0? 1.1 : 0.9);
    setScale((prev) => Math.min(Math.max((prev * zoomFactor),0.5),2));
  }

  function changeToolHandler(e: any) {
    // e.preventDefault();
    console.log("change tool");
    setTool(e.target.id);
  }

  return (
    <div className="w-screen h-screen">
      <nav className="flex justify-center items-center gap-4 px-4 py-2 rounded-lg z-20 bg-white text-black  absolute top-5 left-[50%] translate-x-[-50%]">
        <label
          htmlFor="draw"
          className={`border rounded-md px-4 py-2 ${tool === "draw" ? "bg-gray-500" : "bg-white"}`}
        >
          Draw
        </label>
        <input
          onChange={changeToolHandler}
          className="sr-only"
          type="radio"
          id="draw"
          name="tool"
        />

        <label
          htmlFor="pointer"
          className={`border rounded-md px-4 py-2 ${tool === "pointer" ? "bg-gray-500" : "bg-white"}`}
        >
          Pointer
        </label>
        <input
          onChange={changeToolHandler}
          className="sr-only"
          type="radio"
          id="pointer"
          name="tool"
        />
      </nav>
      <canvas
        id="overlay"
        ref={overlayCanvasRef}
        className="z-10 bg-transparent absolute top-0 left-0"
        onMouseDown={mouseDownHandler}
        onMouseMove={mouseMoveHandler}
        onMouseUp={mouseUpHandler}
        onWheel={mouseWheelHandler}
        width={canvasSize?.width}
        height={canvasSize?.height}
      ></canvas>
      <canvas
        id="main"
        ref={mainCanvasRef}
        className="bg-white touch-none"
        onMouseDown={mouseDownHandler}
        onMouseMove={mouseMoveHandler}
        onMouseUp={mouseUpHandler}
        onWheel={mouseWheelHandler}
        width={canvasSize?.width}
        height={canvasSize?.height}
      ></canvas>
    </div>
  );
};

export default Canvas;
