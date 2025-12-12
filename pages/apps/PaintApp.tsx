import React, { useRef, useEffect, useState, useCallback } from 'react';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);

    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(5);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (canvas && container) {
            // Preserve drawing buffer if needed, but for simplicity, we'll clear on resize
            // const imageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            
            if (contextRef.current) {
                contextRef.current.lineCap = 'round';
                contextRef.current.strokeStyle = color;
                contextRef.current.lineWidth = brushSize;
            }
            // if (imageData) contextRef.current?.putImageData(imageData, 0, 0);
        }
    }, [color, brushSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        contextRef.current = context;
        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [resizeCanvas]);
    
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
        }
    }, [color]);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.lineWidth = brushSize;
        }
    }, [brushSize]);

    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        if (e.nativeEvent instanceof MouseEvent) {
             return {
                x: e.nativeEvent.clientX - rect.left,
                y: e.nativeEvent.clientY - rect.top
            };
        }
        if (e.nativeEvent instanceof TouchEvent) {
             return {
                x: e.nativeEvent.touches[0].clientX - rect.left,
                y: e.nativeEvent.touches[0].clientY - rect.top
            };
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!contextRef.current) return;
        const { x, y } = getPosition(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        isDrawingRef.current = true;
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current || !contextRef.current) return;
        const { x, y } = getPosition(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    }, []);
    
    const stopDrawing = useCallback(() => {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        isDrawingRef.current = false;
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 w-full bg-gray-100 dark:bg-slate-800 p-2 border-b border-gray-300 dark:border-slate-700">
                <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-light-text dark:text-dark-text">Paint</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="color-picker" className="text-sm font-medium text-light-text dark:text-dark-text">Color</label>
                            <input id="color-picker" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-2 border-gray-300 dark:border-slate-600 rounded-md cursor-pointer" />
                        </div>
                        <div className="flex items-center space-x-2">
                             <label htmlFor="brush-size" className="text-sm font-medium text-light-text dark:text-dark-text">Brush Size: {brushSize}</label>
                            <input id="brush-size" type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-32" />
                        </div>
                        <button onClick={clearCanvas} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center space-x-2">
                           <TrashIcon />
                           <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="flex-grow w-full bg-white dark:bg-gray-900 overflow-hidden">
                <canvas 
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair"
                />
            </div>
        </div>
    );
};

export default PaintApp;