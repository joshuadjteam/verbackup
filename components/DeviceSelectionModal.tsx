
import React from 'react';

interface DeviceSelectionModalProps {
    onSelect: (type: 'mobile' | 'desktop') => void;
}

const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({ onSelect }) => {
    return (
        <div className="fixed inset-0 z-[50000] bg-black/95 flex flex-col items-center justify-center p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-10 text-center">Are you using Mobile?</h1>
            <div className="flex flex-col w-full max-w-xs space-y-6">
                <button 
                    onClick={() => onSelect('mobile')}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-transform active:scale-95 shadow-xl flex items-center justify-center space-x-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <span className="text-xl">Mobile</span>
                </button>
                <button 
                    onClick={() => onSelect('desktop')}
                    className="w-full py-5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white font-bold rounded-2xl transition-transform active:scale-95 shadow-xl flex items-center justify-center space-x-3 border border-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-xl">PC</span>
                </button>
            </div>
        </div>
    );
};

export default DeviceSelectionModal;
