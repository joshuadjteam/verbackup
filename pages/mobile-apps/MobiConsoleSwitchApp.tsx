import React from 'react';

const DesktopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const MobiConsoleSwitchApp: React.FC = () => {
    return (
        <div className="w-full h-full p-8 bg-dark-bg text-light-text dark:text-white flex flex-col items-center justify-center text-center">
            <DesktopIcon />
            <h1 className="text-2xl font-bold mb-2">Desktop Feature</h1>
            <p className="text-gray-400 max-w-sm">
                Console switching is a feature exclusive to the desktop version of Lynix. The mobile experience is optimized with a single, consistent interface.
            </p>
        </div>
    );
};

export default MobiConsoleSwitchApp;