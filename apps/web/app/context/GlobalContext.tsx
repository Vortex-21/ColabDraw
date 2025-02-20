'use client'
import React, { useState, createContext, useContext } from "react";
import { GlobalContextProps } from "./GlobalContextProps";
// import { createContext } from "vm";

export const globalContext = createContext<GlobalContextProps|null>(null); 
export function GlobalContextProvider({children}:{children:React.ReactNode}){ 
    const [value, setValue] = useState('default'); 
    const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    // const [hist, setHist] = useState<Array<Object>>([]);
    const [tool, setTool] = useState("");

    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [panStartCoords, setPanStartCoords] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
    return ( 
        <globalContext.Provider value={{value, setValue, startCoords, setStartCoords, dimensions, setDimensions, isDrawing, setIsDrawing,tool, setTool, isPanning, setIsPanning, panOffset, setPanOffset, panStartCoords, setPanStartCoords, scale, setScale, scaleOffset, setScaleOffset }}> 
            {children}
        </globalContext.Provider> 
    );
}
