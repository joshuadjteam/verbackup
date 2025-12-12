
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

// Icons
const AppleLogo = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.08-3.11-1.06.05-2.31.71-3.06 1.61-.69.82-1.27 2.08-1.09 3.15 1.18.09 2.35-.82 3.07-1.65"/></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ControlCenterIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-600" fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.04 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.48.48 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const LaunchpadIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" strokeWidth={0} {...props}>
       <path fillRule="evenodd" d="M4 5a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zM4 12a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zM4 19a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm7 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
    </svg>
);

interface MacLaunchProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const MacLaunch: React.FC<MacLaunchProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { wallpaper, setWallpaper } = useTheme();
    const [time, setTime] = useState(new Date());
    const [appleMenuOpen, setAppleMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [launchpadOpen, setLaunchpadOpen] = useState(false);
    
    const appleMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (appleMenuRef.current && !appleMenuRef.current.contains(event.target as Node)) {
                setAppleMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Desktop apps strictly as requested
    const DESKTOP_APPS_IDS = ['app-phone', 'app-chat', 'app-localmail'];
    
    const DOCK_APPS = useMemo(() => appsList.filter(app => !app.isHidden && !DESKTOP_APPS_IDS.includes(app.id) && ['app-browser', 'app-files', 'app-webly-store', 'app-contacts', 'app-calendar', 'app-notepad'].includes(app.id)), [appsList]);
    
    const desktopApps = useMemo(() => appsList.filter(app => DESKTOP_APPS_IDS.includes(app.id)), [appsList]);
    const allApps = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
    };

    return (
        <div className={`w-screen h-screen overflow-hidden flex flex-col text-white ${(wallpapers[wallpaper] || wallpapers.canyon).class} font-sans select-none`}>
            {/* Top Menu Bar */}
            <div className="h-7 bg-white/20 backdrop-blur-md flex items-center justify-between px-4 text-sm font-medium shadow-sm z-50">
                <div className="flex items-center space-x-4">
                    <div className="relative" ref={appleMenuRef}>
                        <button onClick={() => setAppleMenuOpen(!appleMenuOpen)} className="hover:text-gray-200"><AppleLogo /></button>
                        {appleMenuOpen && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl text-black py-1 z-50 border border-white/20">
                                <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-300 mb-1">Lynix macOS</div>
                                <button onClick={() => { setSettingsOpen(true); setAppleMenuOpen(false); }} className="w-full text-left px-3 py-1 hover:bg-blue-500 hover:text-white rounded">System Preferences...</button>
                                <div className="border-t border-gray-300 my-1"></div>
                                <button onClick={() => logout()} className="w-full text-left px-3 py-1 hover:bg-blue-500 hover:text-white rounded">Log Out {user?.username}...</button>
                            </div>
                        )}
                    </div>
                    <span className="font-bold">Lynix</span>
                    <span className="hidden sm:inline hover:text-gray-200 cursor-default">File</span>
                    <span className="hidden sm:inline hover:text-gray-200 cursor-default">Edit</span>
                    <span className="hidden sm:inline hover:text-gray-200 cursor-default">View</span>
                    <span className="hidden sm:inline hover:text-gray-200 cursor-default">Go</span>
                    <span className="hidden sm:inline hover:text-gray-200 cursor-default">Window</span>
                    <button onClick={() => navigate('support')} className="hidden sm:inline hover:text-gray-200 cursor-default">Help</button>
                </div>
                <div className="flex items-center space-x-4">
                    <SearchIcon />
                    <ControlCenterIcon />
                    <span>{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Desktop Area (Icons on Right Grid) */}
            <div className="flex-grow p-4 flex flex-col items-end space-y-4 content-start flex-wrap-reverse">
                 {desktopApps.map(app => (
                    <button key={app.id} onClick={() => handleAppClick(app)} className="w-20 flex flex-col items-center group">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border border-white/10 mb-1 group-active:bg-black/20">
                             {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-9 h-9" })}
                        </div>
                        <span className="text-xs text-center font-medium text-white drop-shadow-md bg-black/0 group-hover:bg-black/20 rounded px-1">{app.label}</span>
                    </button>
                ))}
            </div>

            {/* Settings Window */}
            {settingsOpen && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#ececec] text-black rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col z-40 animate-fade-in-up">
                    <div className="h-8 bg-[#e0e0e0] border-b border-gray-300 flex items-center px-3 space-x-2">
                        <div className="flex space-x-1.5">
                            <button onClick={() => setSettingsOpen(false)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"></button>
                            <button className="w-3 h-3 rounded-full bg-yellow-500"></button>
                            <button className="w-3 h-3 rounded-full bg-green-500"></button>
                        </div>
                        <span className="flex-grow text-center text-sm font-semibold text-gray-600">System Preferences</span>
                    </div>
                    <div className="p-6 grid grid-cols-4 gap-6 content-start">
                        <div className="col-span-4 flex items-center space-x-4 mb-4 p-2 bg-white rounded-lg shadow-sm">
                             <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">{user?.username.charAt(0).toUpperCase()}</div>
                             <div>
                                 <h3 className="font-bold text-lg">{user?.username}</h3>
                                 <p className="text-xs text-gray-500">Apple ID, iCloud, Media & App Store</p>
                             </div>
                        </div>
                        
                        <div className="col-span-4 border-t border-gray-300 pt-4">
                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Desktop & Dock</h4>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {Object.entries(wallpapers).map(([key, val]) => (
                                    <button key={key} onClick={() => setWallpaper(key)} className={`flex-shrink-0 w-24 h-16 rounded border-2 ${val.class} ${wallpaper === key ? 'border-blue-500' : 'border-transparent'}`}></button>
                                ))}
                            </div>
                        </div>
                        
                        <button onClick={() => navigate('profile')} className="flex flex-col items-center space-y-1 group">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow group-active:bg-gray-400"><SettingsIcon className="w-6 h-6 text-gray-600"/></div>
                            <span className="text-xs text-gray-700">General</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Launchpad Overlay */}
            {launchpadOpen && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-2xl flex flex-col items-center justify-center animate-fade-in"
                    onClick={() => setLaunchpadOpen(false)}
                >
                    <div className="w-full max-w-6xl p-10" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-y-12 gap-x-8 justify-items-center">
                            {allApps.map(app => (
                                <button 
                                    key={app.id} 
                                    onClick={() => { handleAppClick(app); setLaunchpadOpen(false); }} 
                                    className="flex flex-col items-center group w-28 transition-transform duration-200 active:scale-95"
                                >
                                    <div className="w-20 h-20 bg-transparent rounded-[1.5rem] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-3">
                                        {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-20 h-20 drop-shadow-2xl" })}
                                    </div>
                                    <span className="text-sm font-medium text-white text-center leading-tight drop-shadow-md">{app.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dock */}
            <div className="mb-2 flex justify-center z-50">
                <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl px-2 py-2 flex items-end space-x-2 shadow-2xl">
                    {/* Launcher Button */}
                    <button 
                        onClick={() => setLaunchpadOpen(true)}
                        className="w-12 h-12 bg-gray-400/30 hover:bg-gray-300/50 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-2 hover:scale-110 relative group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-inner">
                             <LaunchpadIcon className="w-6 h-6 text-white opacity-90" />
                        </div>
                        <span className="absolute -top-10 bg-gray-200/90 backdrop-blur text-black/80 text-xs font-semibold px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm border border-white/20">Launchpad</span>
                    </button>

                    <div className="w-[1px] h-10 bg-white/20 mx-1"></div>

                    {DOCK_APPS.map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => handleAppClick(app)} 
                            className="w-12 h-12 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-2 hover:scale-110 relative group"
                        >
                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-9 h-9" })}
                            <span className="absolute -top-10 bg-gray-200/90 backdrop-blur text-black/80 text-xs font-semibold px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm border border-white/20">{app.label}</span>
                        </button>
                    ))}
                    
                    <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
                    
                    <button 
                        onClick={() => setSettingsOpen(true)}
                        className="w-12 h-12 bg-gray-300 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-2 hover:scale-110 relative group"
                    >
                        <SettingsIcon />
                        <span className="absolute -top-10 bg-gray-200/90 backdrop-blur text-black/80 text-xs font-semibold px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm border border-white/20">System Preferences</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MacLaunch;
