'use client'
import React, { useEffect, useRef, useState } from 'react'
import { initDraw } from '../../../draw/index';
import { useParams } from 'next/navigation';
enum Shapes { 
  rect = 'rectangle', 
  circle= 'circle'
}
const Canvas = () => {
  const {roomId} = useParams(); 
  const canvasRef = useRef<HTMLCanvasElement|null>(null); 
  const [selectedShape, setSelectedShape] = useState<Shapes>(Shapes.rect); 
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || !roomId || typeof(roomId)!=='string') return;

      ctx.fillStyle = 'rgba(0,0,0)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height); 
      initDraw(roomId, canvas, selectedShape); 


      
    }
  }, [canvasRef, selectedShape]);

  
  return (
    <div className="flex flex-col justify-center items-center gap-1p-2">
      <nav className="w-full bg-red-900">
        <div className={`${selectedShape === Shapes.rect ? 'bg-white':''}`} onClick={(e) => {setSelectedShape(Shapes.rect)}}>rectangle</div>
        <div className={`${selectedShape === Shapes.circle ? 'bg-white':''}`} onClick={(e) => {setSelectedShape(Shapes.circle)}}>circle</div>
      </nav>
      <div className="w-full min-h-screen">
      <canvas className="cursor-crosshair" ref = {canvasRef} width={window.innerWidth} height={window.innerHeight} id="drawingCanvas" ></canvas>
      </div>
    </div>
  )
}

export default Canvas