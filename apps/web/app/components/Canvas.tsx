"use client";
import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import { ToastContainer } from "react-toastify";
import { initDraw } from "../../draw";
import { notify } from "../../utils";
import { ErrorPage } from "./error";
import { checkCookies } from "../utils/cookie-check";
enum Shapes {
  rectangle = "rectangle",
  circle = "ellipse",
}

export const Canvas = ({ roomId, ws }: { roomId: number; ws: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shapes>(Shapes.rectangle);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !roomId ) return;

      ctx.fillStyle = "rgba(0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      initDraw(roomId, canvas, selectedShape, ws);
      console.log("called 1");
    }
  }, [selectedShape]);

  useEffect(() => {
    console.log("called-2");
    // const prevData =  getPrevData();

    checkCookies(setIsAuthenticated);

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "rgba(0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!roomId) return;

      initDraw(roomId, canvas, selectedShape, ws);
    }
  }, [canvasRef]);

  async function shareHandler() {
    const response = await axios.post(
      `http://localhost:3002/api/v1/share-room/`,
      { roomId: Number(roomId) },
      { withCredentials: true }
    );
    console.log(response.data.shareId);
    window.navigator.clipboard.writeText(response.data.shareId);
    notify("ShareId copied to clipboard!", true);
  }

  // async function startSessionHandler(e: any) {
  //   e.preventDefault();
  //   if (ws.readyState === ws.OPEN) {
  //     ws.send(
  //       JSON.stringify({
  //         type: "join",
  //         payload: {
  //           roomId: roomId,
  //         },
  //       })
  //     );
  //   }
  //   // else{ 
  //   //   notify("Cannot join session. Please reload the session", false);
  //   // }
  // }

  return isAuthenticated ? (
    <div className="flex flex-col justify-center items-center gap-1p-2">
      <ToastContainer />
      <nav className="w-full bg-red-900">
        <div>
          <div
            className={`${selectedShape === Shapes.rectangle ? "bg-white" : ""}`}
            onClick={(e) => {
              setSelectedShape(Shapes.rectangle);
            }}
          >
            rectangle
          </div>

          <div
            className={`${selectedShape === Shapes.circle ? "bg-white" : ""}`}
            onClick={(e) => {
              setSelectedShape(Shapes.circle);
            }}
          >
            circle
          </div>
          <div onClick={shareHandler}>Share</div>
          {/* <button onClick={startSessionHandler}>Start Session</button> */}
        </div>
      </nav>
      <div className="w-full min-h-screen">
        <canvas
          className="cursor-crosshair"
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          id="drawingCanvas"
        ></canvas>
      </div>
    </div>
  ) : (
    <ErrorPage />
  );
};
export default Canvas;
