
import React, { useMemo } from 'react';
import { Page, AppLaunchable } from '../../types';

const LegacyLauncher: React.FC<{ navigate: (page: Page, params?: any) => void, appsList: AppLaunchable[] }> = ({ navigate, appsList }) => {
    const allApps = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    return (
        <div className="w-full h-full bg-[#111] text-white font-sans flex flex-col overflow-hidden">
            {/* Legacy Status Bar */}
            <div className="h-6 bg-black flex items-center justify-end px-2 text-xs font-bold border-b border-[#333]">
                <span>12:00</span>
                <div className="ml-2 w-4 h-4 bg-white rounded-sm"></div>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-[#222] border-b border-[#333]">
                <input type="text" placeholder="Google Search" className="w-full bg-white text-black p-2 rounded-sm text-sm" />
            </div>

            {/* Grid */}
            <div className="flex-grow p-4 grid grid-cols-4 gap-4 content-start overflow-y-auto">
                {allApps.map(app => (
                    <button key={app.id} onClick={() => navigate(app.page, { appData: app })} className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#333] rounded-lg flex items-center justify-center mb-1 border-2 border-[#444]">
                            {/* Simplified Icon rendering */}
                            <div className="text-white scale-75">
                                {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-300 truncate w-16 text-center">{app.label}</span>
                    </button>
                ))}
            </div>

            {/* Dock */}
            <div className="h-16 bg-black flex justify-around items-center border-t-2 border-[#333]">
                <button onClick={() => navigate('app-phone')} className="flex flex-col items-center justify-center w-12">
                    <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center font-bold">P</div>
                </button>
                <button onClick={() => navigate('home')} className="flex flex-col items-center justify-center w-12">
                    <div className="w-10 h-10 bg-[#444] rounded-full grid grid-cols-2 gap-0.5 p-2">
                        <div className="bg-white"></div><div className="bg-white"></div>
                        <div className="bg-white"></div><div className="bg-white"></div>
                    </div>
                </button>
                <button onClick={() => navigate('app-browser')} className="flex flex-col items-center justify-center w-12">
                    <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center font-bold">B</div>
                </button>
            </div>
        </div>
    );
};

export default LegacyLauncher;