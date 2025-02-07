import axios from "axios";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";


enum Shapes {
  rect = "rectangle",
  circle = "circle",
}
// let history: Array<Shapes> = [];
let history: Array<Drawable> = [];
let finalShape: Drawable;

export async function initDraw(roomId:string, canvas: HTMLCanvasElement, selectedShape: Shapes) {

  // const prevData = await axios.get(`http://localhost:3002/api/v1/geometryHistory/${roomId}`, {withCredentials:true}); 
  // console.log(prevData); 
  console.log("shape: ", selectedShape); 
  const rc = rough.canvas(canvas);
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  let startX = 0,
    startY = 0;
  let clicked: boolean = false;
  history.forEach((el:Drawable) => rc.draw(el)); 
  canvas.onmousedown = (e: MouseEvent) => {
    clicked = true;

    startX = e.offsetX;
    startY = e.offsetY;
  };

  canvas.onmousemove = (e: MouseEvent) => {
    if (clicked) {
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;
      clearCanvas(ctx, canvas, rc);
      if (selectedShape == Shapes.rect) {
        const rect = rc.rectangle(startX, startY, width, height, {
          roughness: 1,
          stroke: "red",
          strokeWidth: 1,
          fill: "rgba(0,0,0,0.05)",
          fillStyle: 'hachure',
          hachureAngle: 30,
          hachureGap: 45,
        });
        finalShape = rect;
      } else if (selectedShape == Shapes.circle) {
        const circle = rc.ellipse(startX+width/2 , startY+height/2, width, height, {
          roughness: 0.2,
          stroke: "red",
          strokeWidth: 1,
          fill: "rgba(0,0,0,0.05)",
          fillStyle: 'hachure',
          hachureAngle: 45,
          hachureGap: 5,
        });
        finalShape = circle; 
      }
    }
  };

  canvas.onmouseup = (e: MouseEvent) => {
    // const endWidth = e.offsetX - startX;
    // const endHeight = e.offsetY - startY;
    clicked = false;
    history.push(finalShape);
    // history.push({
    //   type: "rectangle",
    //   x: startX,
    //   y: startY,
    //   width: endWidth,
    //   height: endHeight,
    // });
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
