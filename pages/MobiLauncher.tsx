
import React, { useState, useMemo, useEffect } from 'react';
import { Page, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

// Re-defined Icons for independence in this file
const PhoneIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-[#004a77]" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const MessageIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-[#004a77]" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>;
const ChromeIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full p-1">
        <circle cx="50" cy="50" r="45" fill="white"/>
        <circle cx="50" cy="50" r="18" fill="white"/>
        <circle cx="50" cy="50" r="14" fill="#1A73E8"/>
        <path d="M50 22 L50 10 A 40 40 0 0 1 84.6 30 L67.3 40 Z" fill="#E53935"/>
        <path d="M84.6 30 A 40 40 0 0 1 50 90 L50 70 L67.3 40 Z" fill="#4CAF50"/>
        <path d="M50 90 A 40 40 0 0 1 15.4 30 L32.7 40 L50 70 Z" fill="#FFC107"/>
        <path d="M15.4 30 A 40 40 0 0 1 50 10 L50 22 L32.7 40 Z" fill="#E53935"/>
    </svg>
);
const PlayStoreIcon = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="none">
        <path d="M5 3.8C4.8 4 4.7 4.3 4.7 4.6V19.4C4.7 19.7 4.8 20 5 20.2L5.1 20.3L13.5 11.9V11.8L5.1 3.6L5 3.8Z" fill="#00E2F2"/>
        <path d="M16.7 15.1L13.5 11.9L5.1 20.3C5.6 20.8 6.4 20.9 7.1 20.5L16.7 15.1Z" fill="#FF3A44"/>
        <path d="M16.7 8.9L7.1 3.5C6.4 3.1 5.6 3.2 5.1 3.7L13.5 12.1L16.7 8.9Z" fill="#00E676"/>
        <path d="M16.7 15.1L20.2 13.1C21.2 12.5 21.2 11.5 20.2 10.9L16.7 8.9L13.5 12.1L16.7 15.1Z" fill="#FFC400"/>
    </svg>
);
const CameraIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-[#004a77]" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>;
const GoogleG = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.6v3.1h3.92c2.28-2.1 3.6-5.2 3.6-8.94z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.92-2.91l-3.91-3.1c-1.08.72-2.45 1.16-4 1.16-3.13 0-5.78-2.11-6.73-4.96H1.5v3.1C3.47 21.11 7.6 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.19c-.25-.74-.39-1.53-.39-2.35 0-.82.14-1.61.38-2.35V6.39H1.5A11.99 11.99 0 0 0 0 11.84c0 1.98.47 3.89 1.35 5.59l4.175-3.24z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.2 1.19 15.49 0 12.255 0 7.6 0 3.47 2.89 1.5 6.39l4.02 3.12c.96-2.85 3.61-4.96 6.74-4.96z"/></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>;
const LensIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9a5 5 0 0 1 5-5 1 1 0 0 1 1 1 1 1 0 0 0 2 0 1 1 0 0 1 1 1 5 5 0 0 1-5 5 1 1 0 0 1-1 1 1 1 0 0 0-2 0 1 1 0 0 1-1-1z"/></svg>;

interface MobiLauncherProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const MobiLauncher: React.FC<MobiLauncherProps> = ({ navigate, appsList }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState(new Date());
    const [pageIndex, setPageIndex] = useState(0);
    const { wallpaper } = useTheme();
    const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerSearch, setDrawerSearch] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
            setSearchQuery('');
        }
    };

    const dockItems = [
        { id: 'app-phone', icon: <PhoneIcon />, bg: 'bg-[#C2E7FF]' },
        { id: 'app-chat', icon: <MessageIcon />, bg: 'bg-[#C2E7FF]' },
        { id: 'app-webly-store', icon: <PlayStoreIcon />, bg: 'bg-white' }, 
        { id: 'app-browser', icon: <ChromeIcon />, bg: 'bg-white' }, 
        { id: 'app-camera', icon: <CameraIcon />, bg: 'bg-[#C2E7FF]' }
    ];

    const handleAppClick = (appId: string) => {
        const app = appsList.find(a => a.id === appId);
        if (app) {
            if (app.isWebApp) {
                navigate('mobi-app-webview', { url: app.url, title: app.label, appData: app });
            } else {
                navigate(app.page, { appData: app });
            }
        }
        setIsDrawerOpen(false);
    };

    // Filter apps for grid (excluding dock)
    const allGridApps = useMemo(() =>
        appsList.filter(app => !app.isHidden && !['app-phone', 'app-chat', 'app-webly-store', 'app-browser', 'app-camera'].includes(app.id)),
        [appsList]
    );

    // All apps for Drawer (sorted alpha)
    const allDrawerApps = useMemo(() => 
        appsList.filter(app => !app.isHidden)
        .sort((a, b) => a.label.localeCompare(b.label))
        .filter(app => app.label.toLowerCase().includes(drawerSearch.toLowerCase())),
        [appsList, drawerSearch]
    );

    const ITEMS_PER_PAGE = 20; 
    const totalPages = Math.ceil(allGridApps.length / ITEMS_PER_PAGE);
    const currentApps = allGridApps.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE);
    const bgClass = wallpaper ? "" : "bg-gradient-to-b from-[#4A6C8C] via-[#2C4763] to-[#1F364D]";

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        
        const diffX = touchStart.x - touchEnd.x;
        const diffY = touchStart.y - touchEnd.y;

        // Detect Sweep Up for Drawer (Vertical dominant)
        if (diffY > 50 && Math.abs(diffY) > Math.abs(diffX)) {
            setIsDrawerOpen(true);
        } 
        // Detect Swipe Left/Right for Pages (Horizontal dominant)
        else if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) { // Swipe Left -> Next
                if (pageIndex < totalPages - 1) setPageIndex(pageIndex + 1);
            } else { // Swipe Right -> Prev
                if (pageIndex > 0) setPageIndex(pageIndex - 1);
            }
        }
        
        setTouchStart(null);
    };

    return (
        <div 
            className={`w-full h-full flex flex-col relative overflow-hidden font-sans text-white ${bgClass}`}
            style={wallpaper ? {} : { background: 'linear-gradient(180deg, #4A6C8C 0%, #2C4763 40%, #1F364D 100%)' }}
        >
            {wallpaper && <div className={`absolute inset-0 ${wallpapers[wallpaper]?.class || 'bg-gray-800'} -z-10 opacity-100`} />}

            {/* Top Area: Clock & At A Glance */}
            <div className="pt-16 px-4 mb-2 flex-shrink-0">
                <div className="text-6xl font-normal opacity-90 tracking-tighter">
                    {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="text-sm opacity-80 mt-1 font-medium tracking-wide pl-1">
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Paged App Grid Area (Flexible Height) */}
            <div 
                className="flex-grow flex flex-col relative touch-pan-y" 
                onTouchStart={handleTouchStart} 
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex-grow grid grid-cols-5 grid-rows-4 gap-2 p-4 items-start content-start">
                    {currentApps.map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => handleAppClick(app.id)}
                            className="flex flex-col items-center space-y-1 group w-full"
                        >
                            <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center shadow-md overflow-hidden group-active:scale-90 transition-transform">
                                {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-7 h-7 text-[#4A6C8C]" })}
                            </div>
                            <span className="text-[10px] text-white drop-shadow-md truncate w-full text-center font-normal tracking-wide">{t(app.label as any) || app.label}</span>
                        </button>
                    ))}
                </div>

                {/* Pagination Indicators */}
                {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 pb-2 h-6">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setPageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${i === pageIndex ? 'bg-white' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Dock & Search (Fixed Height) */}
            <div 
                className="flex-shrink-0 pb-14 px-4 bg-gradient-to-t from-black/20 to-transparent pt-4"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex justify-between items-center px-1 mb-4">
                    {dockItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => handleAppClick(item.id)}
                            className="flex flex-col items-center active:scale-95 transition-transform"
                        >
                            <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center shadow-lg overflow-hidden`}>
                                {item.icon}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-[#F1F5F9] rounded-full h-12 flex items-center px-4 shadow-lg mb-2">
                    <GoogleG />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-grow bg-transparent border-none outline-none ml-3 text-gray-800 placeholder-gray-500 text-base"
                        placeholder={t('searchWeb')}
                    />
                    <div className="flex space-x-4 pl-2">
                        <button className="p-1"><MicIcon /></button>
                        <button className="p-1"><LensIcon /></button>
                    </div>
                </div>
            </div>

            {/* App Drawer Overlay */}
            <div 
                className={`fixed inset-0 bg-white dark:bg-[#1c1c1e] z-50 transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="p-4 pt-12 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={drawerSearch}
                            onChange={(e) => setDrawerSearch(e.target.value)}
                            placeholder={t('searchApps')}
                            className="w-full bg-gray-100 dark:bg-[#2c2c2e] rounded-full py-3 pl-12 pr-4 text-black dark:text-white focus:outline-none"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 grid grid-cols-5 gap-y-6 gap-x-2 content-start">
                    {allDrawerApps.map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => handleAppClick(app.id)}
                            className="flex flex-col items-center space-y-2 group w-full"
                        >
                            <div className="w-14 h-14 bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl flex items-center justify-center shadow-sm overflow-hidden group-active:scale-95 transition-transform">
                                {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8 text-gray-700 dark:text-gray-300" })}
                            </div>
                            <span className="text-xs text-black dark:text-white truncate w-full text-center font-medium">{t(app.label as any) || app.label}</span>
                        </button>
                    ))}
                </div>
                {/* Close Handle Area */}
                <div className="h-12 flex items-center justify-center" onClick={() => setIsDrawerOpen(false)}>
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default MobiLauncher;
