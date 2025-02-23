import React, { useEffect, useRef, useState } from "react";
interface shapeMetaData {
  shape:string
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
    if (!isDrawing) mainCtx.strokeStyle = "red";

    overlayCtx.lineWidth = 2;
    if (!isDrawing) mainCtx.lineWidth = 2;

    hist.forEach((el: shapeMetaData) => {
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

  
  function getCurrMouseCoords(e: any) {
    return {
      x: (e.clientX - panOffset.x * scale + scaleOffset.x) / scale,
      y: (e.clientY - panOffset.y * scale + scaleOffset.y) / scale,
    };
  }
  ws.onmessage = (event) => { 
    const mainCanvas = mainCanvasRef.current;
    if(!mainCanvas)return; 
    const mainCtx = mainCanvas.getContext("2d");
    if(!mainCtx)return; 
    const message = JSON.parse(event.data.toString());
    console.log("Recieved message: " + JSON.stringify(message))
    console.log("transformed coords: ", { 
      startX: (message.startX-panOffset.x*scale + scaleOffset.x)/scale, 
      startY: (message.startY-panOffset.y*scale + scaleOffset.y)/scale
      ,width: message.width, 
      height:message.height
    })
    if(message.type === "geo") {
      mainCtx.beginPath();
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2; 
    //   mainCtx.rect((message.startX-panOffset.x*scale + scaleOffset.x)/scale, (message.startY-panOffset.y*scale+scaleOffset.y)/
    // scale, message.width/scale, message.height/scale);
      mainCtx.rect((message.startX*scale+panOffset.x*scale-scaleOffset.x),(message.startY*scale+panOffset.y*scale-scaleOffset.y), message.width*scale, message.height*scale);
      // mainCtx.rect(message.startX, message.startY, message.width, message.height);
      mainCtx.stroke();
      mainCtx.closePath();
      setHist([...hist, {shape: message.shape, x: message.startX, y: message.startY, width: message.width, height: message.height}]);

    }
    
    

  }
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
    // console.log("mouse move: ", { 
    //   x: e.clientX, 
    //   y: e.clientY
    // });
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
      console.log("drawing done!");
      setIsDrawing(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      mainCtx.strokeStyle = "red";
      mainCtx.lineWidth = 2;
      mainCtx.save();
      // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); //clear the main canvas.
      mainCtx.translate(
        panOffset.x * scale - scaleOffset.x,
        panOffset.y * scale - scaleOffset.y
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
      // console.log("sending: ", { 
      //   startX: (drawStartCoords.x*scale + panOffset.x*scale - scaleOffset.x),
      //     startY: (drawStartCoords.y*scale + panOffset.y*scale - scaleOffset.y),
      //     width: dimensions.width*scale,
      //     height: dimensions.height*scale,
      // })
      // ws.send(JSON.stringify({ 
      //   type: "chat",
      //   payload: {
      //     shape: "rectangle",
      //     startX: (drawStartCoords.x*scale + panOffset.x*scale - scaleOffset.x),
      //     startY: (drawStartCoords.y*scale + panOffset.y*scale - scaleOffset.y),
      //     width: dimensions.width*scale,
      //     height: dimensions.height*scale,
      //     roomId:roomId
      //   },
      // }))
      console.log("sending: ", { 
        startX: (drawStartCoords.x),
          startY: (drawStartCoords.y),
          width: dimensions.width,
          height: dimensions.height,
      })
      ws.send(JSON.stringify({ 
        type: "chat",
        payload: {
          shape: "rectangle",
          startX: drawStartCoords.x,
          startY: drawStartCoords.y,
          width: dimensions.width,
          height: dimensions.height,
          roomId: roomId
        },
      })); 
      setHist((prev) => {
        return [
          ...prev,
          {
            shape:'rectangle', 
            x: drawStartCoords.x,
            y: drawStartCoords.y,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]; //store the shape in the history array.
      });
    } else {
      console.log("zoomed or panned!");
      setIsPanning(false);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); //clear the overlay canvas.
      mainCtx.save();
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.translate(
        panOffset.x * scale - scaleOffset.x,
        panOffset.y * scale - scaleOffset.y
      );
      mainCtx.scale(scale, scale);
      mainCtx.strokeStyle = "red";
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
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 2));
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
