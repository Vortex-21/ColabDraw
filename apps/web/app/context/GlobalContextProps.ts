export interface GlobalContextProps {
    value: string;
    setValue: (newValue: string) => void;
    startCoords: { x: number, y: number };
    setStartCoords: (newStartCoords: { x: number, y: number }) => void;
    dimensions: { width: number, height: number };
    setDimensions: (newDimensions: { width: number, height: number }) => void;
    isDrawing: boolean;
    setIsDrawing: (newIsDrawing: boolean) => void;
    tool: string;
    setTool: (newTool: string) => void;
    isPanning: boolean;
    setIsPanning: (newIsPanning: boolean) => void;
    panOffset: { x: number, y: number };
    setPanOffset: (newPanOffset: { x: number, y: number }) => void;
    panStartCoords: { x: number, y: number };
    setPanStartCoords: (newPanStartCoords: { x: number, y: number }) => void;
    scale: number;
    setScale: (newScale: number) => void;
    scaleOffset: { x: number, y: number };
    setScaleOffset: (newScaleOffset: { x: number, y: number }) => void;
  }