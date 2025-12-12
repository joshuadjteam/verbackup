
import React, { useState, useMemo } from 'react';
import { Page, AppLaunchable } from '../../types';
import { useTheme, wallpapers } from '../../hooks/useTheme';

// Icons
const PhoneIcon = () => <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CameraIcon = () => <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>;

interface BB10LauncherProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const BB10Launcher: React.FC<BB10LauncherProps> = ({ navigate, appsList }) => {
    const { wallpaper } = useTheme();
    const [page, setPage] = useState<'active' | 'grid'>('grid');

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { appData: app });
    };

    // BB10 Style Icons: Square with shadow, transparent inner
    const allApps = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    // Mock Active Frames (Recents)
    const activeFrames = allApps.slice(0, 4); 

    return (
        <div 
            className={`w-full h-full flex flex-col relative overflow-hidden font-sans text-white bg-black/90`}
            style={{ 
                background: wallpaper ? undefined : 'linear-gradient(to bottom, #2c3e50, #000000)',
            }}
        >
            {wallpaper && <div className={`absolute inset-0 ${wallpapers[wallpaper]?.class || 'bg-gray-900'} -z-10 opacity-50`} />}

            {/* Status Bar Spacer */}
            <div className="h-8 w-full bg-transparent"></div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col">
                {/* Page Indicator / Navigation (Simulated Swipe) */}
                <div className="flex justify-center space-x-2 mb-4">
                    <button onClick={() => setPage('active')} className={`w-2 h-2 rounded-full ${page === 'active' ? 'bg-blue-500' : 'bg-gray-600'}`}></button>
                    <button onClick={() => setPage('grid')} className={`w-2 h-2 rounded-full ${page === 'grid' ? 'bg-blue-500' : 'bg-gray-600'}`}></button>
                </div>

                {page === 'active' ? (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {activeFrames.map(app => (
                            <div key={app.id} className="aspect-[4/3] bg-gray-800/80 rounded-lg border-2 border-gray-700 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                                <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                                    <span className="text-[10px] font-bold uppercase">{app.label}</span>
                                </div>
                                <div className="opacity-30 scale-150 blur-sm">
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-16 h-16" })}
                                </div>
                            </div>
                        ))}
                        {activeFrames.length === 0 && <div className="col-span-2 text-center text-gray-500 mt-20">No Active Frames</div>}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-y-8 gap-x-4 animate-fade-in">
                        {allApps.map(app => (
                            <button 
                                key={app.id} 
                                onClick={() => handleAppClick(app)}
                                className="flex flex-col items-center space-y-1 group"
                            >
                                <div className="w-16 h-16 bg-transparent rounded-md flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.5)] group-active:scale-95 transition-transform border-b-4 border-black/20">
                                    {/* BB10 Icons often had a specific container look, but we'll use standard icons with effect */}
                                    <div className="bg-gradient-to-b from-white/10 to-transparent w-full h-full rounded-md absolute inset-0 pointer-events-none"></div>
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-10 h-10 drop-shadow-lg" })}
                                </div>
                                <span className="text-[10px] font-medium text-gray-200 truncate w-full text-center shadow-black drop-shadow-md">{app.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* BB10 Dock */}
            <div className="h-16 bg-black/60 backdrop-blur-sm border-t border-white/5 flex items-center justify-around px-6">
                <button onClick={() => navigate('app-phone')} className="p-2 hover:bg-white/10 rounded"><PhoneIcon /></button>
                <button onClick={() => window.open('https://google.com', '_blank')} className="p-2 hover:bg-white/10 rounded"><SearchIcon /></button>
                <button onClick={() => navigate('app-camera')} className="p-2 hover:bg-white/10 rounded"><CameraIcon /></button>
            </div>
        </div>
    );
};

export default BB10Launcher;
