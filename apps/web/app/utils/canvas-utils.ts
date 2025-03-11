import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./pointsToSVG";

export interface shapeMetaData {
  shape: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  text?: string;
  path?: number[][];
}

export function forwardTransform(
  x: number,
  y: number,
  panOffset: { x: number; y: number },
  scaleOffset: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return {
    x: x * scale + panOffset.x * scale - scaleOffset.x,
    y: y * scale + panOffset.y * scale - scaleOffset.y,
  };
}
export function inverseTransform(
  x: number,
  y: number,
  panOffset: { x: number; y: number },
  scaleOffset: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return {
    x: (x - panOffset.x * scale + scaleOffset.x) / scale,
    y: (y - panOffset.y * scale + scaleOffset.y) / scale,
  };
}
export function getInverseTransformedPoints(
  points: number[][],
  panOffset: { x: number; y: number },
  scale: number,
  scaleOffset: { x: number; y: number }
): number[][] {
  let transformedPoints: number[][] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) {
      console.log("No point found!!!");
      continue;
    } // Skip undefined entries
    console.log("point: " + point);
    let x = point[0];
    let y = point[1];

    if (x && y) {
      const transformedResults: { x: number; y: number } = inverseTransform(
        x,
        y,
        panOffset,
        scaleOffset,
        scale
      );
      transformedPoints.push([transformedResults.x, transformedResults.y]);
    } else {
      console.log("NO point!!!");
    }
  }
  return transformedPoints;
}

export function drawShape(
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
export function sendShapeUpdate(ws:WebSocket, shape:string, startX:number=0,startY:number,width:number, height:number, text:string|null, path:string|null, roomId:number){ 
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
export function redrawCanvas(
  hist: Array<shapeMetaData>,
  mainCanvasRef: React.RefObject<HTMLCanvasElement>,
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>,
  panOffset: { x: number; y: number },
  scale: number,
  isDrawing: boolean,
  scaleOffsetRef: React.RefObject<{ x: number; y: number }>,
  dimensionsRef: React.RefObject<{ width: number; height: number }>,
  drawStartCoords: { x: number; y: number },
  font: number
) {
  const mainCanvas = mainCanvasRef.current;
  const overlayCanvas = overlayCanvasRef.current;
  if (!overlayCanvas || !mainCanvas) return;
  const overlayCtx = overlayCanvas.getContext("2d");
  const mainCtx = mainCanvas.getContext("2d");
  if (!overlayCtx || !mainCtx) return;

  const scaledHeight = mainCanvas.height * scale;
  const scaledWidth = mainCanvas.width * scale;
  if (scaleOffsetRef.current)
    scaleOffsetRef.current.x = (scaledWidth - mainCanvas.width) / 2;
  if (scaleOffsetRef.current)
    scaleOffsetRef.current.y = (scaledHeight - mainCanvas.height) / 2;
  // y: (scaledHeight - mainCanvas.height) / 2,
  // }
  overlayCtx.save();
  mainCtx.save();

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  if (!isDrawing) mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

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
  renderHistoryElements(hist, mainCtx, overlayCtx, isDrawing, font);
  if (isDrawing && dimensionsRef.current) {
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

export function renderText(
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

export function renderHistoryElements(
  historyArray: Array<shapeMetaData>,
  mainCtx: CanvasRenderingContext2D,
  overlayCtx: CanvasRenderingContext2D | null,
  isDrawing: boolean,
  font: number
) {
  historyArray.forEach((el: shapeMetaData) => {
    if (el.shape === "rectangle") {
      if (overlayCtx) {
        drawShape(
          overlayCtx,
          el.shape,
          el.startX,
          el.startY,
          el.width,
          el.height
        );
      }

      if (!isDrawing) {
        drawShape(mainCtx, el.shape, el.startX, el.startY, el.width, el.height);
      }
    } else if (el.shape === "text" && el.text) {
      if (overlayCtx) {
        renderText(overlayCtx, el.text, el.startX, el.startY + 20, font);
      }

      if (!isDrawing) {
        renderText(mainCtx, el.text, el.startX, el.startY + 20, font);
      }
    } else if (el.shape === "painting" && el.path) {
      const currPath = new Path2D(getSvgPathFromStroke(getStroke(el.path)));

      if (overlayCtx) {
        overlayCtx.beginPath();
        overlayCtx.fill(currPath);
        overlayCtx.closePath();
      }
      if (!isDrawing) {
        mainCtx.fillStyle = "red";
        const currPath = new Path2D(getSvgPathFromStroke(getStroke(el.path)));
        mainCtx.beginPath();
        mainCtx.fill(currPath);
        mainCtx.closePath();
      }
    }
  });
}
export function setupCanvas(ctx:CanvasRenderingContext2D, panOffset:{x:number,y:number}, scaleOffset:{x:number,y:number}, scale:number){ 
  ctx.translate(
    panOffset.x * scale - scaleOffset.x,
    panOffset.y * scale - scaleOffset.y
  );
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.scale(scale, scale);

}

export function updateHistory(hist:Array<shapeMetaData>, newContent: any) {
  hist.push({
    shape: newContent.shape,
    startX: newContent.startX,
    startY: newContent.startY,
    width: newContent.shape === "text"? 0 : newContent.width,
    height: newContent.shape === "text"? 0 : newContent.height,
    text: newContent.shape === "text"? newContent.text : null,
    path: newContent.shape === "painting"? newContent.path : null,
  });
}
