import React, { useRef, useCallback } from 'react';
import { WindowInstance } from '../types';

interface WindowComponentProps {
    win: WindowInstance;
    onClose: (id: string) => void;
    onFocus: (id: string) => void;
    onMinimize: (id: string) => void;
    onPositionChange: (id: string, newPosition: { x: number, y: number }) => void;
    onSizeChange: (id: string, newSize: { width: number, height: number }) => void;
    isActive: boolean;
    children: React.ReactNode;
}

const WindowComponent: React.FC<WindowComponentProps> = ({ win, onClose, onFocus, onMinimize, onPositionChange, onSizeChange, isActive, children }) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!headerRef.current || !windowRef.current) return;
        if (!headerRef.current.contains(e.target as Node) || (e.target as HTMLElement).closest('button')) return;

        onFocus(win.id);
        
        const startPos = { x: e.clientX, y: e.clientY };
        const initialPos = { x: win.position.x, y: win.position.y };

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startPos.x;
            const dy = moveEvent.clientY - startPos.y;
            const parentRect = windowRef.current?.parentElement?.getBoundingClientRect();

            let newX = initialPos.x + dx;
            let newY = initialPos.y + dy;
            
            if(parentRect && windowRef.current) {
                newX = Math.max(0, newX);
                newY = Math.max(0, newY);
                newX = Math.min(newX, parentRect.width - windowRef.current.offsetWidth);
                newY = Math.min(newY, parentRect.height - windowRef.current.offsetHeight);
            }

            onPositionChange(win.id, { x: newX, y: newY });
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

    }, [win.id, win.position, onFocus, onPositionChange]);
    
     const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onFocus(win.id);

        const startSize = { width: win.size.width, height: win.size.height };
        const startPos = { x: e.clientX, y: e.clientY };

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startPos.x;
            const dy = moveEvent.clientY - startPos.y;

            const newWidth = Math.max(350, startSize.width + dx);
            const newHeight = Math.max(250, startSize.height + dy);
            
            onSizeChange(win.id, { width: newWidth, height: newHeight });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

    }, [win.id, win.size, onFocus, onSizeChange]);

    return (
        <div
            ref={windowRef}
            className={`absolute rounded-lg shadow-2xl flex flex-col bg-light-card dark:bg-dark-card border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-200 pointer-events-auto ${isActive ? 'scale-100 shadow-blue-500/30' : 'scale-95 opacity-80'}`}
            style={{
                width: win.size.width,
                height: win.size.height,
                transform: `translate(${win.position.x}px, ${win.position.y}px)`,
                zIndex: win.zIndex,
                display: win.state === 'minimized' ? 'none' : 'flex',
                minWidth: '350px',
                minHeight: '250px'
            }}
            onMouseDown={() => onFocus(win.id)}
        >
            <div
                ref={headerRef}
                onMouseDown={onMouseDown}
                className="flex items-center justify-between px-3 py-1 bg-gray-200 dark:bg-slate-800 cursor-grab active:cursor-grabbing flex-shrink-0"
            >
                 <div className="flex items-center flex-grow overflow-hidden">
                    <span className="font-bold text-sm text-light-text dark:text-dark-text truncate">{win.title}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button onClick={() => onMinimize(win.id)} className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600" />
                    <button onClick={() => onClose(win.id)} className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600" />
                </div>
            </div>
            <div className="flex-grow w-full h-full overflow-hidden relative min-h-0">
                {children}
            </div>
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
                onMouseDown={onResizeMouseDown}
            />
        </div>
    );
};

export default WindowComponent;