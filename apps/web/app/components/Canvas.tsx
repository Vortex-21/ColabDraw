"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/pointsToSVG";
import ToolBox from "./ToolBox";
import { drawShape, forwardTransform, getInverseTransformedPoints, inverseTransform, redrawCanvas, renderHistoryElements, renderText, sendShapeUpdate, setupCanvas, updateHistory } from "../utils/canvas-utils";
interface shapeMetaData {
  shape: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  text?: string;
  path?: number[][];
}
const Canvas = ({ roomId, ws }: { roomId: number; ws: WebSocket }) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [font, setFont] = useState<number>(18);
  const [action, setAction] = useState<string|null>(null); 
  const [tool, setTool] = useState("draw");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const isPanning = useRef<boolean>(false);  
  const isWriting = useRef<boolean>(false); 
  const freeHand = useRef<boolean>(false); 
  const drawStartCoords = useRef<{x:number, y:number}>({x:0, y:0}); 
  const panStartCoords = useRef<{x:number, y:number}>({x:0, y:0}); 
  const writingCoords = useRef<{x:number, y:number}>({x:0, y:0}); 
  const dimensionsRef = useRef<{width:number, height:number}>({width:0, height:0}); 
  const panOffsetRef = useRef<{x:number,y:number}>({x:0,y:0});  
  const scaleOffsetRef = useRef<{x:number,y:number}>({x:0, y:0}); 
  const scaleRef = useRef<number>(1); 
  const histRef = useRef<Array<shapeMetaData>>([]); 
  const pointsRef = useRef<number[][]>([]); 
 
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext("2d");
    if (!mainCtx) return;

    async function getHistory() {
      const response = await axios.get(
        `http://localhost:3002/api/v1/geometryHistory/${roomId}`,
        { withCredentials: true }
      );
      console.log("response : ", response);
      let geometryHistory = response.data.geometryHistory;
      let historyData: Array<shapeMetaData> = [];
      geometryHistory.forEach(
        (el: {
          startX: number;
          startY: number;
          width: number;
          height: number;
          shape: string;
          text: string;
          path: string;
        }) => {
          if (el.shape === "rectangle") {
            historyData.push({
              shape: el.shape,
              startX: el.startX,
              startY: el.startY,
              width: el.width,
              height: el.height,
            });
            if (mainCtx) {
              mainCtx.strokeStyle = "red";
              mainCtx.lineWidth = 2;
              drawShape(
                mainCtx,
                el.shape,
                el.startX,
                el.startY,
                el.width,
                el.height
              );
            }
          } else if (el.shape === "text") {
            historyData.push({
              shape: el.shape,
              startX: el.startX,
              startY: el.startY,
              width: 0,
              height: 0,
              text: el.text,
            });

            if (mainCtx) {
              renderText(mainCtx, el.text, el.startX, el.startY + 20, font);
            }
          } else if (el.shape === "painting") {
            historyData.push({
              shape: el.shape,
              startX: el.startX,
              startY: el.startY,
              width: el.width,
              height: el.height,
              path: JSON.parse(el.path),
            });

            if (mainCtx) {
              mainCtx.fillStyle = "red";
              // mainCtx.lineWidth = 2;
              const currPath = new Path2D(
                getSvgPathFromStroke(getStroke(JSON.parse(el.path)))
              );
              mainCtx.fill(currPath);
            }
          }
        }
      );
      histRef.current.push(...historyData); 
    }
    getHistory();
  }, []);

  useEffect(() => {
    if (!canvasSize) {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, [canvasSize]);

  useEffect(() => {
    if(action === 'writing')
    {if (!textAreaRef.current) return;
    textAreaRef.current.style.position = "absolute";
    textAreaRef.current.style.top = writingCoords.current.y + "px";
    textAreaRef.current.style.left = writingCoords.current.x + "px";
    textAreaRef.current.focus();}
  }, [action]);

  function getCurrMouseCoords(e: any) {
    const coords = inverseTransform(e.clientX, e.clientY, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
    return {
      x:coords.x, 
      y:coords.y
    }
  }

  ws.onmessage = (event) => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext("2d");
    if (!mainCtx) return;
    const message = JSON.parse(event.data.toString());

    if (message.type === "geo") {
      if (message.shape === "rectangle") {
        
        mainCtx.strokeStyle = "red";
        mainCtx.lineWidth = 2;
        
        const newCoords = forwardTransform(message.startX, message.startY, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
        
        drawShape(mainCtx, message.shape, newCoords.x, newCoords.y, message.width*scaleRef.current, message.height*scaleRef.current);
        
        updateHistory(histRef.current, message);

      } else if (message.shape === "text") {

        const newCoords = forwardTransform(message.startX, message.startY, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
        
        renderText(mainCtx, message.text, newCoords.x, newCoords.y+20*scaleRef.current, font*scaleRef.current); 
        
        updateHistory(histRef.current, message);

      } else if (message.shape === "painting") {

        mainCtx.fillStyle = "red";

        let receivedPoints = JSON.parse(message.path);
        let transformedPoints = receivedPoints.map((el: any) => {
          const newPoint = forwardTransform(el[0],el[1], panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
          
          return [
            newPoint.x, 
            newPoint.y
         ]
        }); 

        const currPath = new Path2D(
          getSvgPathFromStroke(getStroke(transformedPoints))
        );

        mainCtx.beginPath();
        mainCtx.fill(currPath);
        mainCtx.closePath();

        updateHistory(histRef.current, { ...message, path: receivedPoints });

      }
    }
  };

  

  function mouseDownHandler(e: any) {
    console.log("mouse down", {
      x: e.clientX,
      y: e.clientY,
    });
    const curr = getCurrMouseCoords(e);
    if (tool === "draw") {
      isDrawing.current = true; 
      isPanning.current = false; 
      isWriting.current = false; 
      freeHand.current = false; 
      // setDrawStartCoords(curr);
      drawStartCoords.current = curr; 
    } else if (tool === "pointer") {
      if(action !== "panning")setAction("panning"); 

      isPanning.current = true; 
      isDrawing.current = false; 
      isWriting.current = false; 
      freeHand.current = false; 

      panStartCoords.current = {
        x: e.clientX - panOffsetRef.current.x,
        y: e.clientY - panOffsetRef.current.y,
      };
    } else if (tool === "pencil") {
      isDrawing.current = false; 
      isPanning.current = false; 
      isWriting.current = false; 
      freeHand.current = true; 

      pointsRef.current = [];
      pointsRef.current.push([e.clientX, e.clientY]);
    }
  }

  function doubleClickHandler(e: any) {
    console.log("double click!!!");

    if (tool === "text") {
      // setIsWriting(true);
      setAction("writing"); 
      isWriting.current = true; 

      
      writingCoords.current = {x:e.clientX, y:e.clientY}; 
    }
  }

  function mouseMoveHandler(e: any) {
    const curr = getCurrMouseCoords(e);
    if (isDrawing.current) {
      let width = curr.x - drawStartCoords.current.x;
      let height = curr.y - drawStartCoords.current.y;

      
      dimensionsRef.current = {width:width, height:height}; 
      redrawCanvas(histRef.current, mainCanvasRef, overlayCanvasRef, panOffsetRef.current, scaleRef.current, isDrawing.current, scaleOffsetRef, dimensionsRef, drawStartCoords.current, font); 
    } else if (isPanning.current) {
      if (mainCanvasRef.current)
       
        panOffsetRef.current = { 
          x: e.clientX - panStartCoords.current.x, 
          y: e.clientY - panStartCoords.current.y
        }
        redrawCanvas(histRef.current, mainCanvasRef, overlayCanvasRef, panOffsetRef.current, scaleRef.current, isDrawing.current, scaleOffsetRef, dimensionsRef, drawStartCoords.current, font); 
    } else if (freeHand.current) {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const overlayCtx = overlayCanvas.getContext("2d");
      if (!overlayCtx) return;

      const currPoint = [e.clientX, e.clientY];
      console.log("currPoint: " + currPoint);
     
      pointsRef.current.push(currPoint); 
      const stroke = getStroke(pointsRef.current, {
        size: 10,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.5,
      });
      const pathData = getSvgPathFromStroke(stroke);
      const currPath = new Path2D(pathData);
      overlayCtx.beginPath();
      overlayCtx.fillStyle = "red";
      overlayCtx.fill(currPath);
      overlayCtx.closePath();
      
    }
  }

  function resetAllActions(){ 
    isDrawing.current = false; 
      isWriting.current = false; 
      isPanning.current = false; 
      freeHand.current = false; 
  }
  function mouseUpHandler(e: any) {
    // e.preventDefault();
    console.log("MOUSE UP!@!")
    const mainCanvas = mainCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!mainCanvas || !overlayCanvas) return;

    const mainCtx = mainCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");

    if (!mainCtx || !overlayCtx) return;
    
    if (isDrawing.current && dimensionsRef.current.width && dimensionsRef.current.height) {
      console.log("drawing done!");

      resetAllActions(); 
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      mainCtx.save();
      setupCanvas(mainCtx, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
      drawShape(
        mainCtx,
        "rectangle",
        drawStartCoords.current.x,
        drawStartCoords.current.y,
        dimensionsRef.current.width,
        dimensionsRef.current.height
      );

      mainCtx.restore();

      
      sendShapeUpdate(ws, "rectangle", drawStartCoords.current.x, drawStartCoords.current.y, dimensionsRef.current.width, dimensionsRef.current.height, null, null, roomId); 

      updateHistory(histRef.current, {
        shape: "rectangle",
        startX: drawStartCoords.current.x,
        startY: drawStartCoords.current.y,
        width: dimensionsRef.current.width,
        height: dimensionsRef.current.height,
      });
    } else if (isPanning.current) {
      
      if(action === 'panning')setAction(null); 
      resetAllActions();
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); //clear the overlay canvas.
      mainCtx.save();
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      setupCanvas(mainCtx, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current);
      renderHistoryElements(histRef.current, mainCtx, null, isDrawing.current, font); 

      mainCtx.restore();
    } else if (isWriting.current) {
      if(action === 'writing')setAction(null);
      resetAllActions(); 
      // is writing
      if (textAreaRef.current && textAreaRef.current.value) {
        renderText(
          mainCtx,
          textAreaRef.current.value,
          writingCoords.current.x,
          writingCoords.current.y + 20 * scaleRef.current,
          font * scaleRef.current
        );
        let newStart = inverseTransform(writingCoords.current.x, writingCoords.current.y, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
        updateHistory(histRef.current, {
          shape: "text",
          startX:newStart.x,
          startY:newStart.y,
          width: 0,
          height: 0,
          text: textAreaRef.current?.value,
        });
        sendShapeUpdate(ws, "text", newStart.x, newStart.y, 0, 0, textAreaRef.current.value, null, roomId); 
      }

      
    } else if (freeHand.current) {
      freeHand.current = false; 
      if (pointsRef.current) {
        const path = new Path2D(getSvgPathFromStroke(getStroke(pointsRef.current))); 
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        mainCtx.fillStyle = "red";
        let transformedPoints = getInverseTransformedPoints(pointsRef.current, panOffsetRef.current, scaleRef.current, scaleOffsetRef.current); 
       
        mainCtx.beginPath();
        mainCtx.fill(path);
        mainCtx.closePath();
        updateHistory(histRef.current, {
          shape: "painting",
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
          path: transformedPoints,
        }); 
        sendShapeUpdate(ws, "painting", 0,0,0,0,null, JSON.stringify(transformedPoints),roomId); 
      }
    }
  }

  function mouseWheelHandler(e: any) {
    
    console.log("mouse wheel");
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    let currScale = scaleRef.current; 
    scaleRef.current = Math.min(Math.max(currScale* zoomFactor, 0.5), 20);
    redrawCanvas(histRef.current, mainCanvasRef, overlayCanvasRef, panOffsetRef.current, scaleRef.current, isDrawing.current, scaleOffsetRef, dimensionsRef, drawStartCoords.current, font);
  }

  function changeToolHandler(e: any) {
    setTool(e.target.id);
  }
  

  return (
    <div className="w-screen h-screen">
      {/* <svg/> */}
      {action === 'writing' && (
        <textarea
          style={{ fontSize: `${font * scaleRef.current}px` }}
          ref={textAreaRef}
          className={`bg-transparent 
                      border-none 
                      outline-none 
                      focus:outline-none 
                      focus:ring-0 
                      text-red-600
                      caret-red-500 
                      font-[Arial]
                      resize-none
                      `}
        />
      )}
      <ToolBox changeToolHandler={changeToolHandler} tool={tool}></ToolBox>
      <canvas
        onDoubleClick={doubleClickHandler}
        id="overlay"
        ref={overlayCanvasRef}
        className={`z-10 bg-transparent absolute top-0 left-0 ${tool === "draw" ? "cursor-crosshair" : tool === "text" ? "cursor-text" : tool === "pointer" ? "cursor-grab" : ""} ${action === 'panning' ? "cursor-grabbing" : tool === "pointer" ? "cursor-grab" : "cursor-crosshair"}`}
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
        className="bg-[#000000] touch-none"
        width={canvasSize?.width}
        height={canvasSize?.height}
      ></canvas>
    </div>
  );
};

export default Canvas;
