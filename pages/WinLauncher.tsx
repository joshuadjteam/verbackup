
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

// Icons
const WinStartIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"/></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const WifiIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
const VolumeIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const BatteryIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const PowerIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

interface WinLauncherProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const WinLauncher: React.FC<WinLauncherProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { wallpaper, setWallpaper, isDark, setIsDark } = useTheme();
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    
    const startMenuRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
                setStartMenuOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const PINNED_APPS = useMemo(() => appsList.filter(app => ['app-browser', 'app-files', 'app-webly-store', 'app-chat'].includes(app.id)), [appsList]);
    const ALL_APPS = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
        setStartMenuOpen(false);
    };

    return (
        <div className={`w-screen h-screen overflow-hidden flex flex-col text-white ${(wallpapers[wallpaper] || wallpapers.canyon).class} font-sans select-none`}>
            {/* Desktop Grid */}
            <div className="flex-grow p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 content-start justify-start w-full">
                {ALL_APPS.map(app => (
                    <button key={app.id} onClick={() => handleAppClick(app)} className="w-24 h-24 flex flex-col items-center justify-center hover:bg-white/10 rounded-md space-y-2 group">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                             {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
                        </div>
                        <span className="text-xs text-center text-shadow px-1 truncate w-full" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{app.label}</span>
                    </button>
                ))}
            </div>

            {/* Start Menu */}
            {startMenuOpen && (
                <div ref={startMenuRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[600px] h-[700px] bg-[#202020]/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 flex flex-col animate-fade-in-up z-50">
                    <div className="p-6">
                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder="Search for apps, settings, and documents" className="w-full bg-[#333] text-white rounded-full py-2 pl-12 pr-4 focus:outline-none border border-transparent focus:border-blue-500" />
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white">Pinned</h3>
                            <button className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20">All apps &gt;</button>
                        </div>
                        <div className="grid grid-cols-6 gap-4 mb-8">
                            {ALL_APPS.slice(0, 18).map(app => (
                                <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center space-y-2 hover:bg-white/5 p-2 rounded transition-colors">
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
                                    <span className="text-xs text-center truncate w-full">{app.label}</span>
                                </button>
                            ))}
                        </div>
                        <h3 className="text-sm font-bold text-white mb-4">Recommended</h3>
                        <div className="space-y-2">
                            <button onClick={() => navigate('support')} className="w-full flex items-center p-2 hover:bg-white/5 rounded text-left">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 font-bold">?</div>
                                <div>
                                    <div className="text-sm font-medium">Support Center</div>
                                    <div className="text-xs text-gray-400">Get help</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="mt-auto p-4 bg-[#181818] rounded-b-lg flex justify-between items-center border-t border-white/10">
                        <button onClick={() => navigate('profile')} className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded transition-colors">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                            <span className="text-sm font-medium">{user?.username}</span>
                        </button>
                        <div className="flex space-x-2">
                             <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded"><SettingsIcon /></button>
                             <button onClick={() => logout()} className="p-2 hover:bg-red-900/50 rounded text-red-400"><PowerIcon /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Windows Settings Modal */}
            {settingsOpen && (
                <div ref={settingsRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#202020] rounded-lg shadow-2xl border border-white/10 z-50 flex">
                    <div className="w-1/3 bg-[#2b2b2b] p-4 rounded-l-lg">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                            <div>
                                <div className="font-bold">{user?.username}</div>
                                <div className="text-xs text-gray-400">{user?.email}</div>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            <button className="w-full text-left px-4 py-2 bg-white/10 rounded text-sm font-medium text-blue-400 border-l-2 border-blue-400">Personalization</button>
                            <button onClick={() => navigate('profile')} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded text-sm font-medium text-gray-300">Accounts</button>
                        </nav>
                    </div>
                    <div className="w-2/3 p-8">
                        <h2 className="text-2xl font-bold mb-6">Personalization</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Select a theme</label>
                                <div className="flex space-x-4">
                                    <button onClick={() => setIsDark(false)} className={`w-32 h-20 bg-white rounded border-2 ${!isDark ? 'border-blue-500' : 'border-gray-600'} flex items-center justify-center text-black`}>Light</button>
                                    <button onClick={() => setIsDark(true)} className={`w-32 h-20 bg-gray-900 rounded border-2 ${isDark ? 'border-blue-500' : 'border-gray-600'} flex items-center justify-center text-white`}>Dark</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Background</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.entries(wallpapers).map(([key, val]) => (
                                        <button key={key} onClick={() => setWallpaper(key)} className={`h-16 rounded ${val.class} border-2 ${wallpaper === key ? 'border-blue-500' : 'border-transparent'}`}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSettingsOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded">X</button>
                    </div>
                </div>
            )}

            {/* Taskbar */}
            <div className="h-12 bg-[#202020]/80 backdrop-blur-md flex items-center justify-between px-4 border-t border-white/5 z-40">
                <div className="flex-1"></div> {/* Spacer */}
                
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setStartMenuOpen(!startMenuOpen)} 
                        className="p-2 rounded hover:bg-white/10 transition-colors"
                        title="Start"
                    >
                        <WinStartIcon />
                    </button>
                    {PINNED_APPS.map(app => (
                        <button key={app.id} onClick={() => handleAppClick(app)} className="p-2 rounded hover:bg-white/10 transition-colors group relative">
                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{app.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex justify-end items-center space-x-3 h-full">
                    <div className="flex items-center space-x-2 hover:bg-white/10 p-1.5 rounded px-2 cursor-default">
                        <button className="text-xs hover:text-white"><div className="rotate-180">^</div></button>
                    </div>
                    <div className="flex items-center space-x-3 hover:bg-white/10 p-1.5 rounded px-2 cursor-pointer" onClick={() => setSettingsOpen(true)}>
                        <WifiIcon />
                        <VolumeIcon />
                        <BatteryIcon />
                    </div>
                    <div className="text-right text-xs hover:bg-white/10 p-1.5 rounded px-2 cursor-default" onClick={() => navigate('app-calendar')}>
                        <div>{time.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</div>
                        <div>{time.toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinLauncher;
