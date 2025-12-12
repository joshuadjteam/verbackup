
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

// Icons
const LauncherCircle = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="transparent"/><circle cx="12" cy="12" r="4" fill="white"/></svg>;
const WifiIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
const BatteryIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SignOutIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

interface COSLaunchProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const COSLaunch: React.FC<COSLaunchProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { wallpaper, setWallpaper } = useTheme();
    const [time, setTime] = useState(new Date());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const drawerRef = useRef<HTMLDivElement>(null);
    const quickSettingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setDrawerOpen(false);
            }
            if (quickSettingsRef.current && !quickSettingsRef.current.contains(event.target as Node)) {
                setQuickSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const SHELF_APPS = useMemo(() => appsList.filter(app => ['app-browser', 'app-localmail', 'app-files', 'app-webly-store'].includes(app.id)), [appsList]);
    const ALL_APPS = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
        setDrawerOpen(false);
    };

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
            setSearchQuery('');
        }
    };

    return (
        <div className={`w-screen h-screen overflow-hidden flex flex-col text-white ${(wallpapers[wallpaper] || wallpapers.canyon).class} font-sans select-none`}>
            
            {/* App Drawer Overlay */}
            {drawerOpen && (
                <div ref={drawerRef} className="absolute bottom-14 left-4 right-4 top-16 bg-[#202124]/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col p-8 animate-fade-in-up z-50">
                    <div className="w-full max-w-2xl mx-auto mb-8 relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search your device, apps, settings, and web..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-[#3c4043] text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:bg-[#4a4e51] transition-colors"
                            autoFocus
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6 content-start">
                        {ALL_APPS.map(app => (
                            <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center space-y-2 group">
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
                                </div>
                                <span className="text-xs text-center font-medium text-gray-200 group-hover:text-white">{app.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Settings */}
            {quickSettingsOpen && (
                <div ref={quickSettingsRef} className="absolute bottom-14 right-4 w-80 bg-[#202124]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-50 border border-white/5 animate-fade-in-up">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                        <div>
                            <div className="font-bold text-sm">{user?.username}</div>
                            <div className="text-xs text-gray-400">{user?.email}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"><WifiIcon /></div>
                            <span className="text-xs">Network</span>
                        </button>
                        <button className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center"><SettingsIcon /></div>
                            <span className="text-xs">Settings</span>
                        </button>
                        <button onClick={() => navigate('profile')} className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white"><SettingsIcon /></div>
                            <span className="text-xs">Profile</span>
                        </button>
                        <button onClick={() => navigate('support')} className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">?</div>
                            <span className="text-xs">Support</span>
                        </button>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                        <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">Wallpaper</h4>
                        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                            {Object.entries(wallpapers).map(([key, val]) => (
                                <button key={key} onClick={() => setWallpaper(key)} className={`flex-shrink-0 w-12 h-8 rounded border ${wallpaper === key ? 'border-blue-500' : 'border-transparent'} ${val.class}`}></button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button onClick={() => logout()} className="p-2 rounded-full hover:bg-white/10 text-red-400"><SignOutIcon /></button>
                    </div>
                </div>
            )}

            {/* Shelf (Bottom Bar) */}
            <div className="mt-auto h-12 bg-[#202124]/90 flex items-center px-2 space-x-2 z-40 justify-between">
                <div className="flex items-center space-x-2 h-full">
                    <button 
                        onClick={() => setDrawerOpen(!drawerOpen)} 
                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <LauncherCircle />
                    </button>
                    
                    {SHELF_APPS.map(app => (
                        <button key={app.id} onClick={() => handleAppClick(app)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
                    className="h-9 bg-[#f1f3f4]/20 hover:bg-[#f1f3f4]/30 rounded-full px-4 flex items-center space-x-3 text-sm font-medium transition-colors"
                >
                    <span>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <BatteryIcon />
                    <WifiIcon />
                </button>
            </div>
        </div>
    );
};

export default COSLaunch;
