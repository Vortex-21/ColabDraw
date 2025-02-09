import axios from "axios"; 
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";

enum Shapes {
  rect = "rectangle",
  circle = "circle",
}

let history: Array<Drawable> = [];
let finalShape: Drawable;

export async function initDraw(roomId:string, canvas: HTMLCanvasElement, selectedShape: Shapes) {

  const prevData = await axios.get(`http://localhost:3002/api/v1/geometryHistory/${roomId}`, {withCredentials:true}); 
  console.log(prevData); 
  console.log("shape: ", selectedShape); 
  const rc = rough.canvas(canvas);
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  let startX = 0, startY = 0;
  let clicked: boolean = false;
  let width=0 , height=0;
  history.forEach((el:Drawable) => rc.draw(el)); 
  canvas.onmousedown = (e: MouseEvent) => {
    clicked = true;

    startX = e.offsetX;
    startY = e.offsetY;
  };

  canvas.onmousemove = (e: MouseEvent) => {
    if (clicked) {
      width = e.offsetX - startX;
      height = e.offsetY - startY;
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
    
    clicked = false;
    history.push(finalShape);
    const ws = new WebSocket('ws://localhost:3001'); 
    ws.onopen = () => {
      console.log('Connected to websocket server'); 
      console.log('Sending history'); 
      ws.send(JSON.stringify({ 
        type:'chat', 
        payload:{ 
          message:'Drawing', 
          roomId, 
          shape: finalShape.shape, 
          startX, 
          startY, 
          width, 
          height,
        }
      })) 
    }
    ws.onerror = (err:Event) => { 
      console.log('Error sending drawing data: ' + err); 
    }
    ws.onclose = () => { 
      console.log('WebSocket connection closed'); 
    }
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
