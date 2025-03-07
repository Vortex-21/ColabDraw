'use client'
import axios from "axios";
import SquareIcon  from "../icons/SquareIcon";
import React, { useEffect, useRef, useState } from "react";
import { Hand, PointerIcon, TextCursor } from "lucide-react";
interface shapeMetaData {
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
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
  const [isWriting, setIsWriting] = useState(false);
  const [writingCoords, setWritingCoords] = useState({ x: 0, y: 0 });
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
          startX: number
          startY: number
          width: number
          height: number
          shape: string
          text:string
        }) => {
          if (el.shape === "rectangle") {
            historyData.push({
              shape: el.shape,
              x: el.startX,
              y: el.startY,
              width: el.width,
              height: el.height,
            });
            if (mainCtx) {
              mainCtx.strokeStyle = "red";
              mainCtx.lineWidth = 2;

              mainCtx.beginPath();
              mainCtx.rect(el.startX, el.startY, el.width, el.height);
              mainCtx.stroke();
              mainCtx.closePath();
            }
          }
          else if(el.shape === 'text'){ 
            historyData.push({
              shape: el.shape,
              x: el.startX,
              y: el.startY,
              width:0, 
              height:0, 
              text: el.text,
            })

            if (mainCtx) {
              mainCtx.fillStyle = "red";
              mainCtx.font = `${font}px Arial`;
              mainCtx.fillText(el.text, el.startX, el.startY+20); 
            }
          }
        }
      );
      console.log("history Data: ", historyData);
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

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !mainCanvas) return;
    const overlayCtx = overlayCanvas.getContext("2d");
    const mainCtx = mainCanvas.getContext("2d");
    if (!overlayCtx || !mainCtx) return;

    const scaledHeight = mainCanvas.height * scale;
    const scaledWidth = mainCanvas.width * scale;
    setScaleOffset({
      x: (scaledWidth - mainCanvas.width) / 2,
      y: (scaledHeight - mainCanvas.height) / 2,
    });
    overlayCtx.save();
    mainCtx.save();

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    if (!isDrawing)
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    overlayCtx.translate(
      panOffset.x*scale  - (scaledWidth - mainCanvas.width) / 2,
      panOffset.y*scale  - (scaledHeight - mainCanvas.height) / 2
    );
    if (!isDrawing)
      mainCtx.translate(
        panOffset.x*scale - (scaledWidth - mainCanvas.width) / 2,
        panOffset.y*scale - (scaledHeight - mainCanvas.height) / 2
      );

    overlayCtx.scale(scale, scale);
    if (!isDrawing) mainCtx.scale(scale, scale);

    overlayCtx.strokeStyle = "red";
    if (!isDrawing) mainCtx.strokeStyle = "red";

    overlayCtx.lineWidth = 2;
    if (!isDrawing) mainCtx.lineWidth = 2;

    hist.forEach((el: shapeMetaData) => {
      if (el.shape === "rectangle") {
        overlayCtx.beginPath();
        overlayCtx.rect(el.x, el.y, el.width, el.height);
        overlayCtx.stroke();
        overlayCtx.closePath();

        if (!isDrawing) {
          mainCtx.beginPath();
          mainCtx.rect(el.x, el.y, el.width, el.height);
          mainCtx.stroke();
          mainCtx.closePath();
        }
      } else if (el.shape === "text" && el.text) {
        overlayCtx.font = `${font}px Arial`;
        overlayCtx.fillStyle = "red";
        overlayCtx.fillText(el.text, el.x, el.y+20);
        if (!isDrawing) {
          mainCtx.font = `${font}px Arial`;
          mainCtx.fillStyle = "red";
          mainCtx.fillText(el.text, el.x, el.y+20);
        }
      }
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

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.position = "absolute";
    textAreaRef.current.style.top = writingCoords.y + "px";
    textAreaRef.current.style.left = writingCoords.x + "px";
    textAreaRef.current.focus();
  }, [writingCoords]);

  function getCurrMouseCoords(e: any) {
    return {
      x: (e.clientX - panOffset.x*scale + scaleOffset.x) / scale,
      y: (e.clientY - panOffset.y*scale + scaleOffset.y) / scale,
    };
  }

  ws.onmessage = (event) => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext("2d");
    if (!mainCtx) return;
    const message = JSON.parse(event.data.toString());
    
    if (message.type === "geo") {
      if(message.shape==="rectangle")
      {mainCtx.beginPath();
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2;

      mainCtx.rect(
        message.startX * scale + panOffset.x * scale - scaleOffset.x,
        message.startY * scale + panOffset.y * scale - scaleOffset.y,
        message.width * scale,
        message.height * scale
      );

      mainCtx.stroke();
      mainCtx.closePath();
      setHist([
        ...hist,
        {
          shape: message.shape,
          x: message.startX,
          y: message.startY,
          width: message.width,
          height: message.height,
        },
      ]);
    }
    else if(message.shape === 'text'){ 
      mainCtx.fillStyle='red'; 
      mainCtx.font = `${font*scale}px Arial`;
      mainCtx.fillText(message.text,message.startX*scale + panOffset.x*scale - scaleOffset.x, message.startY*scale + panOffset.y*scale - scaleOffset.y + 20*scale);

      setHist([
        ...hist,
        {
          shape: message.shape,
          x: message.startX,
          y: message.startY,
          width: 0,
          height: 0,
          text:message.text
        },
      ]);
    }
    }
  };

  function mouseDownHandler(e: any) {
    // e.preventDefault();
    console.log("mouse down", {
      x: e.clientX,
      y: e.clientY,
    });
    const curr = getCurrMouseCoords(e);
    if (tool === "draw") {
      setIsDrawing(true);
      setDrawStartCoords(curr);
    } else if (tool === "pointer") {
      setIsPanning(true);
      setPanStartCoords({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    } 
  }

  function doubleClickHandler(e: any) {
    console.log("double click!!!");
    const curr = getCurrMouseCoords(e);

    if (tool === "text") {
      setIsWriting(true);
      // setWritingCoords(curr); 
      setWritingCoords({
        x: e.clientX,
        y: e.clientY,
      });

      // textAreaRef.current?.focus();
    }
  }

  function mouseMoveHandler(e: any) {
    const curr = getCurrMouseCoords(e);
    if (isDrawing) {
      let width = curr.x - drawStartCoords.x;
      let height = curr.y - drawStartCoords.y;

      // if (width && height) {
      //provide the animation on the overlay canvas.
      setDimensions({ width, height });
      // }
    } else if (isPanning) {
      if(mainCanvasRef.current)
      // mainCanvasRef.current.style.cursor='move'
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
    if (isDrawing && dimensions.width && dimensions.height) {
      console.log("drawing done!");
      setIsDrawing(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2;
      mainCtx.save();
      // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); //clear the main canvas.
      mainCtx.translate(
        panOffset.x*scale  - scaleOffset.x,
        panOffset.y*scale  - scaleOffset.y
      );
      mainCtx.scale(scale, scale);

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

      console.log("sending: ", {
        startX: drawStartCoords.x,
        startY: drawStartCoords.y,
        width: dimensions.width,
        height: dimensions.height,
      });
      ws.send(
        JSON.stringify({
          type: "chat",
          payload: {
            shape: "rectangle",
            startX: drawStartCoords.x,
            startY: drawStartCoords.y,
            width: dimensions.width,
            height: dimensions.height,
            roomId: roomId,
          },
        })
      );
      setHist((prev) => {
        return [
          ...prev,
          {
            shape: "rectangle",
            x: drawStartCoords.x,
            y: drawStartCoords.y,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]; //store the shape in the history array.
      });
    } else if(isPanning) {
      setIsPanning(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); //clear the overlay canvas.
      mainCtx.save();
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.translate(
        panOffset.x*scale  - scaleOffset.x,
        panOffset.y*scale  - scaleOffset.y
      );
      mainCtx.scale(scale, scale);
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2;
      mainCtx.fillStyle = "red";
      mainCtx.font = `${font}px Arial`; // Change the font size and style as needed
      hist.forEach((el) => {
        if (el.shape === "rectangle") {
          mainCtx.beginPath();
          mainCtx.rect(el.x, el.y, el.width, el.height);
          mainCtx.stroke();
          mainCtx.closePath();
        } else if (el.shape === "text" && el.text) {
          mainCtx.fillText(el.text, el.x, el.y+20);
        } //end the path.
      });
      
      mainCtx.restore();
    }
    else { // is writing
      if (textAreaRef.current && textAreaRef.current.value) {
        // mainCtx.save();
        // mainCtx.translate(
        //   panOffset.x * scale - scaleOffset.x,
        //   panOffset.y * scale - scaleOffset.y
        // );
        // mainCtx.scale(scale, scale);
        mainCtx.font=`${font*scale}px Arial`; 
        mainCtx.fillStyle='red'; 
        mainCtx.fillText(
          textAreaRef.current.value,
          writingCoords.x,
          writingCoords.y+20*scale
        );
        // mainCtx.restore();
        setHist((prev) => {
          return [
            ...prev,
            {
              shape: "text",
              x: (writingCoords.x - panOffset.x*scale+ scaleOffset.x)/scale,
              y: (writingCoords.y - panOffset.y*scale + scaleOffset.y)/scale,
              width: 0,
              height: 0,
              text: textAreaRef.current?.value,
            },
          ];
        });
        ws.send(
          JSON.stringify({
            type: "chat",
            payload: {
              shape: "text",
              startX: (writingCoords.x - panOffset.x*scale + scaleOffset.x)/scale,
              startY: (writingCoords.y - panOffset.y*scale + scaleOffset.y)/scale,
              width: 0,
              height: 0,
              text:textAreaRef.current.value,
              roomId: roomId,
            },
          })
        );
      }
      
      setIsWriting(false);
    }
  }

  function mouseWheelHandler(e: any) {
    // e.preventDefault();
    console.log("mouse wheel");
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 20));
  }

  function changeToolHandler(e: any) {
    // e.preventDefault();
    console.log("change tool");
    setTool(e.target.id);
  }

  return (
    <div className="w-screen h-screen">
      {isWriting && (
        <textarea
        style={{fontSize:`${font*scale}px`}}
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
      <nav className="flex justify-center items-center gap-4 px-4 py-2 rounded-lg z-20 bg-white text-black  absolute top-5 left-[50%] translate-x-[-50%]">
        <label
          htmlFor="draw"
          className={`rounded-md px-4 py-2 ${tool === "draw" ? "bg-gray-500" : "bg-white hover:bg-gray-300"}`}
        >
          <SquareIcon/>
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
          className={`rounded-md px-4 py-2 ${tool === "pointer" ? "bg-gray-500" : "bg-white hover:bg-gray-300"}`}
        >
            <Hand size={18} strokeWidth={1} />
        </label>
        <input
          onChange={changeToolHandler}
          className="sr-only"
          type="radio"
          id="pointer"
          name="tool"
        />

        <label
          htmlFor="text"
          className={`rounded-md px-4 py-2 ${tool === "text" ? "bg-gray-500" : "bg-white hover:bg-gray-300"}`}
        >
          <TextCursor size={16}/>
        </label>
        <input
          onChange={changeToolHandler}
          className="sr-only"
          type="radio"
          id="text"
          name="tool"
        />
      </nav>
      <canvas
        onDoubleClick={doubleClickHandler}
        id="overlay"
        ref={overlayCanvasRef}
        className={`z-10 bg-transparent absolute top-0 left-0 ${tool === 'draw'?'cursor-crosshair':tool === 'text'?'cursor-text':tool === 'pointer'?'cursor-grab':''} ${isPanning?'cursor-grabbing':tool === 'pointer'?'cursor-grab':'cursor-auto'}` }
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
