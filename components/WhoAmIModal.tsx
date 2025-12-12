
import React from 'react';
import WhoAmIView from './WhoAmIView';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

interface WhoAmIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WhoAmIModal: React.FC<WhoAmIModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60000] p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🆔</span> WhoAmI?
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <WhoAmIView />
                </div>
            </div>
        </div>
    );
};

export default WhoAmIModal;
