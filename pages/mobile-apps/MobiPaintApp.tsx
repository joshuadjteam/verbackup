
import React, { useRef, useEffect, useState, useCallback } from 'react';

const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const MobiPaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (canvas && container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            if (contextRef.current) {
                contextRef.current.lineCap = 'round';
                contextRef.current.strokeStyle = color;
                contextRef.current.lineWidth = brushSize;
            }
        }
    }, [color, brushSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        contextRef.current = context;
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);
    
    useEffect(() => { if (contextRef.current) contextRef.current.strokeStyle = color; }, [color]);
    useEffect(() => { if (contextRef.current) contextRef.current.lineWidth = brushSize; }, [brushSize]);

    const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!contextRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        contextRef.current.beginPath();
        contextRef.current.moveTo(clientX - rect.left, clientY - rect.top);
        isDrawingRef.current = true;
    }, []);

    const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!isDrawingRef.current || !contextRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        contextRef.current.lineTo(clientX - rect.left, clientY - rect.top);
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
        if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212]">
            <div ref={containerRef} className="flex-grow w-full overflow-hidden relative">
                <canvas 
                    ref={canvasRef}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
                    className="touch-none cursor-crosshair bg-white rounded-b-3xl shadow-inner"
                />
            </div>
            
            {/* Floating Tool Palette */}
            <div className="absolute bottom-6 left-4 right-4 bg-[#f3f6fc] dark:bg-[#303030] rounded-full p-2 shadow-xl flex justify-between items-center px-4">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-full border-none bg-transparent" />
                
                <div className="flex items-center space-x-2 mx-4 flex-grow">
                    <span className="text-xs text-gray-500 font-bold">SIZE</span>
                    <input type="range" min="1" max="30" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                </div>

                <button onClick={clearCanvas} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#444] rounded-full text-red-500 shadow-sm">
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

export default MobiPaintApp;
