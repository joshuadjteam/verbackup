
import React from 'react';
import { Page } from '../types';

// Icons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>; // Triangle-ish
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>; // Circle
const RecentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>; // Square

interface MobileNavBarProps {
    navigate: (page: Page) => void;
    onRecents?: () => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ navigate, onRecents }) => {
    
    const handleBack = () => {
        // In a real router, this would go back. 
        // For this app structure, navigating 'home' is the safe fallback if not handled by the app itself.
        // Ideally apps handle their own back, but this is the system back.
        navigate('home');
    };

    const handleHome = () => {
        navigate('home');
    };

    const handleRecents = () => {
        if (onRecents) onRecents();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-12 bg-black text-white/80 flex justify-around items-center z-[9999]">
            <button onClick={handleBack} className="p-4 w-1/3 flex justify-center active:text-white active:scale-90 transition-all">
                <div className="transform rotate-[-90deg]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </div>
            </button>
            <button onClick={handleHome} className="p-4 w-1/3 flex justify-center active:text-white active:scale-90 transition-all">
                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
            </button>
            <button onClick={handleRecents} className="p-4 w-1/3 flex justify-center active:text-white active:scale-90 transition-all">
                <div className="w-4 h-4 rounded-[2px] border-2 border-current"></div>
            </button>
        </div>
    );
};

export default MobileNavBar;
