import axios from "axios";
import { useContext } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { globalContext} from "../app/context/GlobalContext";
// import { useGlobalContext } from "../app/context/useGlobalContext";

enum Shapes {
  rectangle = "rectangle",
  circle = "ellipse",
}

let history: Array<Drawable> = [];
let finalShape: Drawable | null = null;
let pointerCache:Array<PointerEvent> = []; 
let prevDiff:number = -1; 
interface ShapeMetaDataInterface {
  startX: number;
  startY: number;
  width: number;
  height: number;
  shape: Shapes;
}




export async function initDraw(
  roomId: number,
  canvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  
  ws: WebSocket
) {

  // const {tool} = useGlobalContext(); 
  const context = useContext(globalContext); 
  if(!context)return;
  const {tool} = context; 
  const rc = rough.canvas(canvas);
  const rcOverlay = rough.canvas(overlayCanvas);
  const response = await axios.get(
    `http://localhost:3002/api/v1/geometryHistory/${roomId}`,
    { withCredentials: true }
  );
  if (response.status === 200) {
    if (response.data.geometryHistory.length > 0) {
      response.data.geometryHistory.forEach((el: any) => {
        const newShape = makeDrawableObject({shape:el.shape, startX:el.startX, startY:el.startY, width:el.width, height:el.height}); 
        console.log('new shape: ' + newShape); 
        if (newShape) history.push(newShape);
      });
      // history = history.concat(response.data.geometryHistory);
    }
  }

  





  // console.log(prevData);
  // console.log("shape: ", tool);
  let ctx = canvas.getContext("2d");
  let overlayCtx = overlayCanvas.getContext('2d'); 
  if (!ctx || !overlayCtx) {
    return;
  }

  

  






  function makeDrawableObject(metaData: ShapeMetaDataInterface) {
    if (metaData.shape === "rectangle") {
      return rc.rectangle(
        metaData.startX,
        metaData.startY,
        metaData.width,
        metaData.height,
        {
          roughness: 1,
          stroke: "red",
          strokeWidth: 1,
          fill: "rgba(0,0,0,0.05)",
          fillStyle: "hachure",
          hachureAngle: 30,
          hachureGap: 45,
        }
      );
    } else if (metaData.shape === "ellipse") {
      return rc.ellipse(
        metaData.startX + metaData.width / 2,
        metaData.startY + metaData.height / 2,
        metaData.width,
        metaData.height,
        {
          roughness: 0.2,
          stroke: "red",
          strokeWidth: 1,
          fill: "rgba(0,0,0,0.05)",
          fillStyle: "hachure",
          hachureAngle: 45,
          hachureGap: 5,
        }
      );
    }
    return null;
  }

  ws.onmessage = (event) => {
    const shapeMetaData = JSON.parse(event.data.toString());
    let newShape: Drawable | null = makeDrawableObject(shapeMetaData);
    // newShape.shape = shapeMetaData.shape;
    // newShape.x = shapeMetaData.startX;
    console.log("newshape: " + newShape);
    if (newShape) {
      history.push(newShape);
      // clearCanvas(ctx, canvas, rc);
      rc.draw(newShape);
    }
  };
  let startX = 0,startY = 0;
  let clicked: boolean = false;
  let drag: boolean = false;
  let width = 0,height = 0;
  history.forEach((el: Drawable) => rc.draw(el));
 

  overlayCanvas.onmousedown = (e: MouseEvent) => {
    clicked = true;

    startX = e.offsetX;
    startY = e.offsetY;
  };

  overlayCanvas.onmousemove = (e: MouseEvent) => {
    if (clicked) {
      width = e.offsetX - startX;
      height = e.offsetY - startY;
      if (width || height) {
        drag = true;
      }
      // clearCanvas(ctx, canvas, rc);
      overlayCtx.clearRect(0,0,overlayCanvas.width,overlayCanvas.height); 
      if (tool == Shapes.rectangle) {
        const rect = rcOverlay.rectangle(startX, startY, width, height, {
          roughness: 1,
          stroke: "red",
          strokeWidth: 1,
          fill: "rgba(0,0,0,0.05)",
          fillStyle: "hachure",
          hachureAngle: 30,
          hachureGap: 45,
        });
        finalShape = rect;
        rcOverlay.draw(rect);
      } else if (tool == Shapes.circle) {
        const circle = rcOverlay.ellipse(
          startX + width / 2,
          startY + height / 2,
          width,
          height,
          {
            roughness: 0.2,
            stroke: "red",
            strokeWidth: 1,
            fill: "rgba(0,0,0,0.05)",
            fillStyle: "hachure",
            hachureAngle: 45,
            hachureGap: 5,
          }
        );
        finalShape = circle;
        rcOverlay.draw(circle);
      }
    }
  };

  overlayCanvas.onmouseup = (e: MouseEvent) => {
    clicked = false;
    console.log("finalshape: ", finalShape);
    if (!finalShape || !drag) {
      return;
    }
    // if(finalShape!==null)
    rc.draw(finalShape); 
    history.push(finalShape);
    drag = false;
    
    ws.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: "Drawing",
          roomId: roomId,
          shape: finalShape?.shape,
          startX,
          startY,
          width,
          height,
        },
      })
    );
    finalShape = null;
    
  };
  ws.onerror = (err: Event) => {
    console.log("Error sending drawing data: " + err);
  };
  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };
}

function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  rc: RoughCanvas
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  history.forEach((el: Drawable) => rc.draw(el));
}
