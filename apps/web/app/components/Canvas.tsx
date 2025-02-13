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
  const overlayCanvasRef= useRef<HTMLCanvasElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shapes>(Shapes.rectangle);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  useEffect(() => {
    if (canvasRef.current && overlayCanvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const overlayCanvas = overlayCanvasRef.current; 
      if (!ctx || !roomId ||!overlayCanvas) return;

      ctx.fillStyle = "rgba(0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      initDraw(roomId, canvas, overlayCanvas, selectedShape, ws);
    }
  }, [selectedShape]);

  useEffect(() => {

    checkCookies(setIsAuthenticated);

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !roomId || !overlayCanvas) return;
      // if (!roomId) return;

      ctx.fillStyle = "rgba(0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      initDraw(roomId, canvas, overlayCanvas, selectedShape, ws);
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

  

  return isAuthenticated ? (
    <div className="flex  justify-center items-center gap-1p-2">
      <ToastContainer />
      <nav className="rounded-lg py-2 px-4 w-[30%] bg-white z-20 absolute top-5 left-[50%] translate-x-[-50%]">
        <div className="flex items-center justify-evenly">
          <div
            className={`${selectedShape === Shapes.rectangle ? "bg-white" : ""} border rounded-lg py-2 px-4`}
            onClick={(e) => {
              setSelectedShape(Shapes.rectangle);
            }}
          >
            rectangle
          </div>

          <div
            className={`${selectedShape === Shapes.circle ? "bg-white" : ""} border rounded-lg py-2 px-4`}
            onClick={(e) => {
              setSelectedShape(Shapes.circle);
            }}
          >
            circle
          </div>
          <div onClick={shareHandler} className='border'>Share</div>
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
        <canvas
          className="cursor-crosshair absolute  top-0 left-0 z-10"
          ref={overlayCanvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          id="overlayCanvas"
          
        ></canvas>
      </div>
    </div>
  ) : (
    <ErrorPage />
  );
};
export default Canvas;
