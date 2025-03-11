"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/pointsToSVG";
import ToolBox from "./ToolBox";
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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [font, setFont] = useState<number>(18);
  // const [isDrawing, setIsDrawing] = useState(false);
  const [action, setAction] = useState<string|null>(null); 
  const isDrawing = useRef<boolean>(false);
  const [drawStartCoords, setDrawStartCoords] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState("draw");
  // const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const dimensionsRef = useRef<{width:number, height:number}>({width:0, height:0}); 
  const [hist, setHist] = useState<Array<shapeMetaData>>([]);
  // const [isPanning, setIsPanning] = useState(false);
  const isPanning = useRef<boolean>(false);  

  const [panStartCoords, setPanStartCoords] = useState({ x: 0, y: 0 });
  // const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  // const [scale, setScale] = useState(1);
  const scaleRef = useRef<number>(1); 
  const panOffsetRef = useRef<{x:number,y:number}>({x:0,y:0});  
  // const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const scaleOffsetRef = useRef<{x:number,y:number}>({x:0, y:0}); 
  // const [isWriting, setIsWriting] = useState(false);
  const isWriting = useRef<boolean>(false); 
  const [writingCoords, setWritingCoords] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<Array<Array<number>>>([]);
  // const [freeHand, setFreeHand] = useState<boolean>(false);
  const freeHand = useRef<boolean>(false); 
  const [path, setPath] = useState<Path2D | null>(null);
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
      setHist((prev) => {
        return [...prev, ...historyData];
      });
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

  function redrawCanvas(panOffset:{x:number, y:number}, scale:number, isDrawing:boolean){ 
    const mainCanvas = mainCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !mainCanvas) return;
    const overlayCtx = overlayCanvas.getContext("2d");
    const mainCtx = mainCanvas.getContext("2d");
    if (!overlayCtx || !mainCtx) return;

    const scaledHeight = mainCanvas.height * scale;
    const scaledWidth = mainCanvas.width * scale;
    // setScaleOffset({
    //   x: (scaledWidth - mainCanvas.width) / 2,
    //   y: (scaledHeight - mainCanvas.height) / 2,
    // });
    scaleOffsetRef.current = { 
      x: (scaledWidth - mainCanvas.width) / 2,
      y: (scaledHeight - mainCanvas.height) / 2,
    }
    overlayCtx.save();
    mainCtx.save();

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    if (!isDrawing)
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    overlayCtx.translate(
      panOffset.x * scale - (scaledWidth - mainCanvas.width) / 2,
      panOffset.y * scale - (scaledHeight - mainCanvas.height) / 2
    );
    if (!isDrawing)
      mainCtx.translate(
        panOffset.x * scale - (scaledWidth - mainCanvas.width) / 2,
        panOffset.y * scale - (scaledHeight - mainCanvas.height) / 2
      );

    overlayCtx.scale(scale, scale);
    if (!isDrawing) mainCtx.scale(scale, scale);

    overlayCtx.strokeStyle = "red";
    overlayCtx.lineWidth = 2;
    if (!isDrawing) {
      mainCtx.strokeStyle = "red";

      mainCtx.lineWidth = 2;
    }
  renderHistoryElements(hist, mainCtx, overlayCtx, isDrawing); 
    if (isDrawing) {
      drawShape(
        overlayCtx,
        "rectangle",
        drawStartCoords.x,
        drawStartCoords.y,
        dimensionsRef.current.width,
        dimensionsRef.current.height
      );
    }

    overlayCtx.restore();
    mainCtx.restore();
  }
  // useEffect(() => {
  //   redrawCanvas(panOffsetRef.current,scaleRef.current); 
  // }, [dimensions]);

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.position = "absolute";
    textAreaRef.current.style.top = writingCoords.y + "px";
    textAreaRef.current.style.left = writingCoords.x + "px";
    textAreaRef.current.focus();
  }, [writingCoords]);

  function getCurrMouseCoords(e: any) {
    const coords = inverseTransform(e.clientX, e.clientY, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
    // return {
    //   x: (e.clientX - panOffsetRef.current.x * scaleRef.current + scaleOffsetRef.current.x) / scaleRef.current,
    //   y: (e.clientY - panOffsetRef.current.y * scaleRef.current + scaleOffsetRef.current.y) / scaleRef.current,
    // };
    return {
      x:coords.x, 
      y:coords.y
    }
  }

  function renderHistoryElements(historyArray:Array<shapeMetaData>, mainCtx:CanvasRenderingContext2D, overlayCtx:CanvasRenderingContext2D|null, isDrawing:boolean){ 
    historyArray.forEach((el:shapeMetaData) => { 
      if(el.shape === 'rectangle'){ 
        if(overlayCtx){drawShape(
          overlayCtx,
          el.shape,
          el.startX,
          el.startY,
          el.width,
          el.height
        );}

        if(!isDrawing){ 
          drawShape(
            mainCtx,
            el.shape,
            el.startX,
            el.startY,
            el.width,
            el.height
          );
        }
      }
      else if(el.shape === 'text' && el.text){ 
        if(overlayCtx){renderText(overlayCtx, el.text, el.startX, el.startY + 20, font);}

        if(!isDrawing){ 
          renderText(mainCtx, el.text, el.startX, el.startY + 20, font);
        }
      }
      else if(el.shape === 'painting' && el.path){ 
        const currPath = new Path2D(getSvgPathFromStroke(getStroke(el.path))); 

        if(overlayCtx){overlayCtx.beginPath();
        overlayCtx.fill(currPath);
        overlayCtx.closePath();}
        if (!isDrawing) {
          mainCtx.fillStyle = "red";
          // console.log(JSON.parse(el.path));
          const currPath = new Path2D(getSvgPathFromStroke(getStroke(el.path)));
          mainCtx.beginPath();
          mainCtx.fill(currPath);
          mainCtx.closePath();
        }
      }
    })
  }

  function renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    startX: number,
    startY: number,
    font: number
  ) {
    ctx.fillStyle = "red";
    ctx.font = `${font}px Arial`;
    ctx.fillText(text, startX, startY);
  }

  function drawShape(
    ctx: CanvasRenderingContext2D,
    shape: string,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    ctx.beginPath();
    if (shape === "rectangle") {
      ctx.rect(startX, startY, width, height);
    }
    ctx.stroke();
    ctx.closePath();
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
        // drawShape(
        //   mainCtx,
        //   message.shape,
        //   message.startX * scaleRef.current + panOffsetRef.current.x * scaleRef.current - scaleOffset.x,
        //   message.startY * scaleRef.current + panOffsetRef.current.y * scaleRef.current - scaleOffset.y,
        //   message.width * scaleRef.current,
        //   message.height * scaleRef.current
        // );
        drawShape(mainCtx, message.shape, newCoords.x, newCoords.y, message.width*scaleRef.current, message.height*scaleRef.current);
        updateHistory(message);
      } else if (message.shape === "text") {
        const newCoords = forwardTransform(message.startX, message.startY, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
        // renderText(
        //   mainCtx,
        //   message.text,
        //   message.startX * scaleRef.current + panOffsetRef.current.x * scaleRef.current - scaleOffset.x,
        //   message.startY * scaleRef.current +
        //     panOffsetRef.current.y * scaleRef.current -
        //     scaleOffset.y +
        //     20 * scaleRef.current,
        //   font * scaleRef.current
        // );
        renderText(mainCtx, message.text, newCoords.x, newCoords.y+20*scaleRef.current, font*scaleRef.current); 
        updateHistory(message);
      } else if (message.shape === "painting") {
        mainCtx.fillStyle = "white";
        let receivedPoints = JSON.parse(message.path);
        let transformedPoints = receivedPoints.map((el: any) => {
          const newPoint = forwardTransform(el[0],el[1], panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); 
          // return [
          //   el[0] * scaleRef.current + panOffsetRef.current.x * scaleRef.current - scaleOffset.x,
          //   el[1] * scaleRef.current + panOffsetRef.current.y * scaleRef.current - scaleOffset.y,
          // ];
          return [
            newPoint.x, 
            newPoint.y
         ]
        });
        console.log("Res : ", transformedPoints == receivedPoints);
        console.log("received: ", receivedPoints);
        console.log("transformed: ", transformedPoints);
        const currPath = new Path2D(
          getSvgPathFromStroke(getStroke(transformedPoints))
        );
        mainCtx.beginPath();
        mainCtx.fill(currPath);
        mainCtx.closePath();
        // message.path=receivedPoints;
        updateHistory({ ...message, path: receivedPoints });
        // updateHistory({...message, path:receivedPoints});
      }
    }
  };

  function updateHistory(newContent: any) {
    setHist((prev) => [
      ...prev,
      {
        shape: newContent.shape,
        startX: newContent.startX,
        startY: newContent.startY,
        width: newContent.shape === "text" ? 0 : newContent.width,
        height: newContent.shape === "text" ? 0 : newContent.height,
        text: newContent.shape === "text" ? newContent.text : null,
        path: newContent.shape === "painting" ? newContent.path : null,
      },
    ]);
  }

  function mouseDownHandler(e: any) {
    console.log("mouse down", {
      x: e.clientX,
      y: e.clientY,
    });
    const curr = getCurrMouseCoords(e);
    if (tool === "draw") {
      // setIsDrawing(true);
      isDrawing.current = true; 
      isPanning.current = false; 
      isWriting.current = false; 
      freeHand.current = false; 
      setDrawStartCoords(curr);
    } else if (tool === "pointer") {
      // setIsPanning(true);
      if(action !== "panning")setAction("panning"); 

      isPanning.current = true; 
      isDrawing.current = false; 
      // isPanning.current = true; 
      isWriting.current = false; 
      freeHand.current = false; 
      setPanStartCoords({
        x: e.clientX - panOffsetRef.current.x,
        y: e.clientY - panOffsetRef.current.y,
      });
    } else if (tool === "pencil") {
      // setFreeHand(true);
      isDrawing.current = false; 
      isPanning.current = false; 
      isWriting.current = false; 
      // freeHand.current = false; 
      freeHand.current = true; 
      setPoints([[e.clientX, e.clientY, e.pressure]]);
    }
  }

  function doubleClickHandler(e: any) {
    console.log("double click!!!");

    if (tool === "text") {
      // setIsWriting(true);
      isWriting.current = true; 

      setWritingCoords({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }

  function mouseMoveHandler(e: any) {
    const curr = getCurrMouseCoords(e);
    // console.log(freeHand); 
    if (isDrawing.current) {
      let width = curr.x - drawStartCoords.x;
      let height = curr.y - drawStartCoords.y;

      // setDimensions({ width, height });
      // const prevDims = dimensionsRef.current; 
      dimensionsRef.current = {width:width, height:height}; 
      redrawCanvas(panOffsetRef.current, scaleRef.current, isDrawing.current); 
    } else if (isPanning.current) {
      if (mainCanvasRef.current)
        // setPanOffset({
        //   x: e.clientX - panStartCoords.x,
        //   y: e.clientY - panStartCoords.y,
        // });
        panOffsetRef.current = { 
          x: e.clientX - panStartCoords.x, 
          y: e.clientY - panStartCoords.y
        }
        redrawCanvas(panOffsetRef.current, scaleRef.current, isDrawing.current); 
    } else if (freeHand.current) {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const overlayCtx = overlayCanvas.getContext("2d");
      if (!overlayCtx) return;

      const currPoint = [e.clientX, e.clientY];
      console.log("currPoint: " + currPoint);
      setPoints((prev) => [...prev, currPoint]); // Add the new point to the points array.

      const stroke = getStroke(points, {
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
      setPath(currPath);
    }
  }

  function sendShapeUpdate(shape:string, startX:number=0,startY:number,width:number, height:number, text:string|null, path:string|null, roomId:number){ 
    ws.send(JSON.stringify({ 
      type: "chat",
      payload:{ 
        shape: shape, 
        startX: startX, 
        startY: startY, 
        width: width, 
        height: height,
        text: text===null?null:text, 
        path:path === null?null:path,
        roomId: roomId
      } 
    }))
    
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
      // setIsDrawing(false);
      isDrawing.current = false; 
      isWriting.current = false; 
      isPanning.current = false; 
      freeHand.current = false; 
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2;
      mainCtx.save();
      // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); //clear the main canvas.
      mainCtx.translate(
        panOffsetRef.current.x * scaleRef.current - scaleOffsetRef.current.x,
        panOffsetRef.current.y * scaleRef.current - scaleOffsetRef.current.y
      );
      mainCtx.scale(scaleRef.current, scaleRef.current);
      drawShape(
        mainCtx,
        "rectangle",
        drawStartCoords.x,
        drawStartCoords.y,
        dimensionsRef.current.width,
        dimensionsRef.current.height
      );

      mainCtx.restore();

      
      sendShapeUpdate("rectangle", drawStartCoords.x, drawStartCoords.y, dimensionsRef.current.width, dimensionsRef.current.height, null, null, roomId); 

      updateHistory({
        shape: "rectangle",
        startX: drawStartCoords.x,
        startY: drawStartCoords.y,
        width: dimensionsRef.current.width,
        height: dimensionsRef.current.height,
      });
    } else if (isPanning.current) {
      // setIsPanning(false);
      if(action === 'panning')setAction(null); 
      isPanning.current = false; 
      isDrawing.current = false; 
      isWriting.current = false; 
      freeHand.current = false; 
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); //clear the overlay canvas.
      mainCtx.save();
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.translate(
        panOffsetRef.current.x * scaleRef.current - scaleOffsetRef.current.x,
        panOffsetRef.current.y * scaleRef.current - scaleOffsetRef.current.y
      );
      mainCtx.scale(scaleRef.current, scaleRef.current);
      mainCtx.strokeStyle = "red";

      renderHistoryElements(hist, mainCtx, null, isDrawing.current); 

      mainCtx.restore();
    } else if (isWriting.current) {
      // isPanning.current = false; 
      isDrawing.current = false; 
      isWriting.current = false; 
      isPanning.current = false; 
      freeHand.current = false;
      // is writing
      if (textAreaRef.current && textAreaRef.current.value) {
        renderText(
          mainCtx,
          textAreaRef.current.value,
          writingCoords.x,
          writingCoords.y + 20 * scaleRef.current,
          font * scaleRef.current
        );
        let newStart = inverseTransform(writingCoords.x, writingCoords.y, panOffsetRef.current, scaleOffsetRef.current, scaleRef.current); //(writingCoords.x - panOffsetRef.current.x * scaleRef.current + scaleOffset.x) / scaleRef.current;
        // let newStartY = newStart;
        updateHistory({
          shape: "text",
          startX:newStart.x,
          startY:newStart.y,
          width: 0,
          height: 0,
          text: textAreaRef.current?.value,
        });
        sendShapeUpdate("text", newStart.x, newStart.y, 0, 0, textAreaRef.current.value, null, roomId); 
      }

      // setIsWriting(false);
      // isWriting.current = false; 
    } else if (freeHand.current) {
      // setFreeHand(false);
      freeHand.current = false; 
      if (points && path) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        mainCtx.fillStyle = "red";
        let transformedPoints = getInverseTransformedPoints(points, panOffsetRef.current, scaleRef.current); 
        const transformedStroke = getStroke(transformedPoints, {
          size: 10 / scaleRef.current,
          thinning: 0.6,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const svgPathString = getSvgPathFromStroke(transformedStroke);
        console.log("svgPathString : " + svgPathString);
        // const transformedPath = new Path2D(svgPathString);
        mainCtx.beginPath();
        mainCtx.fill(path);
        mainCtx.closePath();
        updateHistory({
          shape: "painting",
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
          path: transformedPoints,
        }); 
        sendShapeUpdate("painting", 0,0,0,0,null, JSON.stringify(transformedPoints),roomId); 
      }
    }
  }

  function mouseWheelHandler(e: any) {
    // e.preventDefault();
    console.log("mouse wheel");
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    // setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 20));
    let currScale = scaleRef.current; 
    scaleRef.current = Math.min(Math.max(currScale* zoomFactor, 0.5), 20);
    redrawCanvas(panOffsetRef.current, scaleRef.current, isDrawing.current); 
  }

  function changeToolHandler(e: any) {
    // e.preventDefault();
    console.log("change tool");
    setTool(e.target.id);
  }
  function forwardTransform(x:number,y:number,panOffset:{x:number,y:number},scaleOffset:{x:number,y:number}, scale:number):{x:number,y:number}{ 
      return {
        x: (x*scale + panOffset.x * scale - scaleOffset.x),
        y: (y*scale + panOffset.y * scale - scaleOffset.y) ,
      };
  }
  function inverseTransform(x:number,y:number,panOffset:{x:number,y:number},scaleOffset:{x:number,y:number}, scale:number):{x:number,y:number}{ 
    return {
      x: (x - panOffset.x * scale + scaleOffset.x)/scale,
      y: (y - panOffset.y * scale + scaleOffset.y)/scale ,
    };
  }
  function getInverseTransformedPoints(points:number[][], panOffset:{x:number,y:number}, scale:number):number[][]{ 
    let transformedPoints:number[][] = []; 
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) {
        console.log("No point found!!!");
        continue;
      } // Skip undefined entries
      console.log("point: " + point);
      let x = point[0];
      let y = point[1];
      // let pressure = point[2];
      // console.log(x,y,pressure);
      if (x && y) {
        // transformedPoints.push([
        //   (x - panOffset.x * scale + scaleOffset.x) / scale,
        //   (y - panOffset.y * scale + scaleOffset.y) / scale,
        // ]);
        const transformedResults:{x:number, y:number} = inverseTransform(x, y, panOffset, scaleOffsetRef.current, scale);
        transformedPoints.push([
          transformedResults.x, 
          transformedResults.y
        ]);
      } else {
        console.log("NO point!!!");
         
      }
    }
    return transformedPoints;
  }

  return (
    <div className="w-screen h-screen">
      {/* <svg/> */}
      {isWriting && (
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
