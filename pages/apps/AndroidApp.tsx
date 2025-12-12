
import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../../types';

// --- Icons for Android UI ---
const WifiIcon = () => <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" /></svg>;
const BatteryIcon = () => <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>;
const SignalIcon = () => <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20V2z" /></svg>;
const BackButton = () => <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const AppsIcon = () => <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>;
const SettingsIcon = () => <svg className="w-full h-full text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.04 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.48.48 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const ChromeIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24"><path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
const PlayIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="none"><path d="M5 3.8C4.8 4 4.7 4.3 4.7 4.6V19.4C4.7 19.7 4.8 20 5 20.2L5.1 20.3L13.5 11.9V11.8L5.1 3.6L5 3.8Z" fill="#00E2F2"/><path d="M16.7 15.1L13.5 11.9L5.1 20.3C5.6 20.8 6.4 20.9 7.1 20.5L16.7 15.1Z" fill="#FF3A44"/><path d="M16.7 8.9L7.1 3.5C6.4 3.1 5.6 3.2 5.1 3.7L13.5 12.1L16.7 8.9Z" fill="#00E676"/><path d="M16.7 15.1L20.2 13.1C21.2 12.5 21.2 11.5 20.2 10.9L16.7 8.9L13.5 12.1L16.7 15.1Z" fill="#FFC400"/></svg>;
const FolderIcon = () => <svg className="w-full h-full text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
const AndroidLogo = () => <svg className="w-24 h-24 text-white mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0225 3.503c-1.4669-.6632-3.1135-1.0602-4.8866-1.0602-1.7419 0-3.3586.3865-4.8114 1.0276L5.446 5.4143a.416.416 0 0 0-.5676-.1521.4157.4157 0 0 0-.1521.5676l1.9703 3.4124C3.1354 10.975 1.0366 14.8773 1 19.343h22c-.0366-4.5065-2.1799-8.4435-5.1185-10.0216"/></svg>;
const APKIcon = () => <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0225 3.503c-1.4669-.6632-3.1135-1.0602-4.8866-1.0602-1.7419 0-3.3586.3865-4.8114 1.0276L5.446 5.4143a.416.416 0 0 0-.5676-.1521.4157.4157 0 0 0-.1521.5676l1.9703 3.4124C3.1354 10.975 1.0366 14.8773 1 19.343h22c-.0366-4.5065-2.1799-8.4435-5.1185-10.0216"/></svg>;

interface AndroidAppProps {
    navigate: (page: Page, params?: any) => void;
}

interface AppItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    installed: boolean;
}

const AndroidApp: React.FC<AndroidAppProps> = ({ navigate }) => {
    const [booting, setBooting] = useState(true);
    const [time, setTime] = useState(new Date());
    const [currentScreen, setCurrentScreen] = useState<'home' | 'drawer' | 'app'>('home');
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [installingApk, setInstallingApk] = useState(false);
    
    const [apps, setApps] = useState<AppItem[]>([
        { id: 'settings', name: 'Settings', icon: <SettingsIcon />, installed: true },
        { id: 'chrome', name: 'Chrome', icon: <ChromeIcon />, installed: true },
        { id: 'files', name: 'Files', icon: <FolderIcon />, installed: true },
        { id: 'playstore', name: 'Play Store', icon: <PlayIcon />, installed: true },
    ]);

    // Sample APKs that can be "installed" from the Files app
    const availableApks = [
        { name: 'flappy_bird.apk', appName: 'Flappy Bird', id: 'flappy' },
        { name: 'minecraft_pe.apk', appName: 'Minecraft', id: 'minecraft' }
    ];

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        // Simulate boot time
        const bootTimer = setTimeout(() => setBooting(false), 3000);
        return () => { clearInterval(timer); clearTimeout(bootTimer); };
    }, []);

    const openApp = (id: string) => {
        setActiveAppId(id);
        setCurrentScreen('app');
    };

    const goHome = () => {
        setActiveAppId(null);
        setCurrentScreen('home');
    };

    const goBack = () => {
        if (currentScreen === 'app' && activeAppId === 'files' && installingApk) {
            setInstallingApk(false);
            return;
        }
        if (currentScreen === 'app' || currentScreen === 'drawer') {
            goHome();
        }
    };

    const installApk = (apkName: string, appName: string, appId: string) => {
        if (window.confirm(`Do you want to install this application?\n\n${appName}\n\nIt does not require any special access.`)) {
            setInstallingApk(true); // Show loading state if we wanted complex UI, but confirm dialog is enough
            setTimeout(() => {
                setApps(prev => {
                    if (prev.find(a => a.id === appId)) return prev;
                    return [...prev, { 
                        id: appId, 
                        name: appName, 
                        icon: <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{appName[0]}</div>, 
                        installed: true 
                    }];
                });
                alert("App Installed.");
                setInstallingApk(false);
            }, 1500);
        }
    };

    const renderActiveApp = () => {
        switch (activeAppId) {
            case 'settings':
                return (
                    <div className="flex flex-col h-full bg-white text-black p-4">
                        <h2 className="text-2xl font-medium mb-6">Settings</h2>
                        <div className="space-y-4">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-bold text-gray-700">About phone</h3>
                                <p className="text-sm text-gray-500">Android 9</p>
                            </div>
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-bold text-gray-700">System</h3>
                                <p className="text-sm text-gray-500">Languages, time, backup, updates</p>
                            </div>
                        </div>
                    </div>
                );
            case 'files':
                return (
                    <div className="flex flex-col h-full bg-white text-black">
                        <div className="bg-blue-600 text-white p-4 shadow-md flex items-center">
                            <span className="font-bold text-lg">Downloads</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {availableApks.map((apk, i) => {
                                const isInstalled = apps.some(a => a.id === apk.id);
                                return (
                                    <div key={i} onClick={() => !isInstalled && installApk(apk.name, apk.appName, apk.id)} className="flex items-center p-3 hover:bg-gray-100 rounded-lg active:bg-gray-200">
                                        <APKIcon />
                                        <div className="ml-4 flex-grow">
                                            <div className="font-medium">{apk.name}</div>
                                            <div className="text-xs text-gray-500">15.4 MB</div>
                                        </div>
                                        {isInstalled && <span className="text-xs text-green-600 font-bold">Installed</span>}
                                    </div>
                                );
                            })}
                            <div className="p-3 text-sm text-gray-400 italic text-center mt-4">No other files found.</div>
                        </div>
                    </div>
                );
            case 'chrome':
                return <div className="w-full h-full bg-white flex items-center justify-center text-gray-500">Simulated Browser</div>;
            case 'playstore':
                return <div className="w-full h-full bg-white flex items-center justify-center text-gray-500">No connection</div>;
            default:
                return <div className="w-full h-full bg-white flex items-center justify-center text-xl font-bold text-gray-300">{activeAppId}</div>;
        }
    };

    if (booting) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center animate-fade-in">
                <AndroidLogo />
                <div className="text-white font-medium tracking-widest mt-4 text-xl">android</div>
                <div className="mt-8 w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-pulse w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black relative flex flex-col overflow-hidden font-sans select-none">
            {/* Status Bar */}
            <div className="h-6 bg-transparent absolute top-0 left-0 right-0 flex justify-between items-center px-2 z-20 text-white text-xs font-medium pointer-events-none">
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex space-x-1.5 items-center">
                    <SignalIcon />
                    <WifiIcon />
                    <BatteryIcon />
                </div>
            </div>

            {/* Screen Content */}
            <div className="flex-grow bg-black relative">
                {/* Wallpaper */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 to-purple-600 opacity-80"></div>
                
                {currentScreen === 'home' && (
                    <div className="relative z-10 h-full flex flex-col p-4 pt-10">
                        {/* Date Widget */}
                        <div className="text-white drop-shadow-md mb-auto">
                            <div className="text-4xl font-light">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-sm opacity-90">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                        </div>

                        {/* Home Screen Icons */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {apps.slice(0, 4).map(app => (
                                <div key={app.id} onClick={() => openApp(app.id)} className="flex flex-col items-center space-y-1 cursor-pointer active:scale-95 transition-transform">
                                    <div className="w-12 h-12 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
                                        {app.icon}
                                    </div>
                                    <span className="text-white text-xs drop-shadow-md">{app.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="w-full bg-white/90 rounded-full p-3 mb-6 shadow-lg flex items-center space-x-3 opacity-90">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                            <span className="text-gray-500 text-sm">Say "Ok Google"</span>
                        </div>
                        
                        {/* Dock Background Hint */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                    </div>
                )}

                {currentScreen === 'app' && (
                    <div className="absolute inset-0 bg-white z-10 pt-6 animate-fade-in-up">
                        {renderActiveApp()}
                    </div>
                )}
                
                {currentScreen === 'drawer' && (
                    <div className="absolute inset-0 bg-white z-10 pt-8 px-4 animate-fade-in-up">
                        <div className="mb-4">
                            <input type="text" placeholder="Search apps..." className="w-full bg-gray-100 rounded-full px-4 py-2 text-black outline-none" />
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            {apps.map(app => (
                                <div key={app.id} onClick={() => openApp(app.id)} className="flex flex-col items-center space-y-2 cursor-pointer active:scale-95">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full p-2 flex items-center justify-center">
                                        {app.icon}
                                    </div>
                                    <span className="text-black text-xs text-center leading-tight">{app.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Bar (Android 9 Pill) */}
            <div className="h-12 bg-black flex items-center justify-center relative z-30">
                {(currentScreen === 'app' || currentScreen === 'drawer') && (
                    <button onClick={goBack} className="absolute left-8 p-2 active:bg-white/10 rounded-full">
                        <BackButton />
                    </button>
                )}
                
                <div 
                    onClick={goHome}
                    onContextMenu={(e) => { e.preventDefault(); setCurrentScreen('drawer'); }}
                    className="w-16 h-3 bg-white/80 rounded-full cursor-pointer active:scale-90 transition-transform"
                ></div>

                {/* Apps Button */}
                <button onClick={() => setCurrentScreen('drawer')} className="absolute right-8 p-2 active:bg-white/10 rounded-full">
                    <AppsIcon />
                </button>
            </div>
        </div>
    );
};

export default AndroidApp;
