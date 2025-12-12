
import React, { useState, useMemo, useEffect } from 'react';
import { Page, AppLaunchable } from '../../types';
import { useTheme, wallpapers } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

const PhoneIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-white" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const MessageIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-white" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>;
const ChromeIcon = () => <div className="w-full h-full flex items-center justify-center bg-white rounded-[1.5rem]"><svg viewBox="0 0 24 24" className="w-8 h-8"><path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>;
const CameraIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-white" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>;
const GalleryIcon = () => <svg viewBox="0 0 24 24" className="w-full h-full p-3 text-white" fill="currentColor"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>;

interface OneUILauncherProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const OneUILauncher: React.FC<OneUILauncherProps> = ({ navigate, appsList }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState(new Date());
    const { wallpaper } = useTheme();
    
    // OneUI Specific: Squircles
    const iconStyle = "rounded-[1.5rem] shadow-md"; 

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

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { appData: app });
    };

    // Dock items for OneUI
    const dockApps = [
        { id: 'app-phone', icon: <PhoneIcon />, bg: 'bg-green-500' },
        { id: 'app-chat', icon: <MessageIcon />, bg: 'bg-blue-500' },
        { id: 'app-browser', icon: <ChromeIcon />, bg: 'bg-transparent' }, 
        { id: 'app-gallery', icon: <GalleryIcon />, bg: 'bg-pink-600' },
        { id: 'app-camera', icon: <CameraIcon />, bg: 'bg-red-600' }
    ];

    const gridApps = useMemo(() => 
        appsList.filter(app => !app.isHidden && !['app-phone', 'app-chat', 'app-browser', 'app-gallery', 'app-camera'].includes(app.id)), 
    [appsList]);

    return (
        <div 
            className={`w-full h-full flex flex-col relative overflow-hidden font-sans text-white`}
            style={{ 
                background: wallpaper ? undefined : 'linear-gradient(180deg, #6a85b6 0%, #bac8e0 100%)',
                fontFamily: 'sans-serif'
            }}
        >
            {wallpaper && <div className={`absolute inset-0 ${wallpapers[wallpaper]?.class || 'bg-gray-800'} -z-10 opacity-100`} />}

            {/* Weather Widget (OneUI Style) */}
            <div className="pt-16 px-6 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-5xl font-light tracking-tight">21°</div>
                        <div className="text-sm font-medium opacity-90">New Delhi</div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-medium">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="text-xs opacity-80">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-grow p-4">
                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {gridApps.slice(0, 16).map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => handleAppClick(app)}
                            className="flex flex-col items-center space-y-1"
                        >
                            <div className={`w-14 h-14 bg-white/90 flex items-center justify-center ${iconStyle}`}>
                                {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8 text-black" })}
                            </div>
                            <span className="text-xs text-white drop-shadow-md truncate w-full text-center">{app.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Search & Dock */}
            <div className="flex-shrink-0 pb-8 px-4">
                <div className="mb-6">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search"
                        className="w-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 rounded-3xl py-3 px-6 text-sm focus:outline-none focus:bg-white/30 transition-colors text-center"
                    />
                </div>
                
                <div className="flex justify-between items-center px-2">
                    {dockApps.map(item => {
                        const app = appsList.find(a => a.id === item.id) || { page: 'home', params: {} };
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => navigate(app.page as any, app.params)}
                                className="flex flex-col items-center active:scale-90 transition-transform"
                            >
                                <div className={`w-14 h-14 ${item.bg} ${iconStyle} flex items-center justify-center overflow-hidden`}>
                                    {item.icon}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OneUILauncher;
