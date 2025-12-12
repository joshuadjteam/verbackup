
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Page, UserRole, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import HelpModal from '../components/HelpModal';

// Icons
const GridIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProfileIconSvg = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface FaisConsoleProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const FaisConsole: React.FC<FaisConsoleProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { isDark, glassBlur, glassTransparency, wallpaper, setWallpaper } = useTheme();
    const [launcherOpen, setLauncherOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const SHELF_APPS = useMemo(() => appsList.filter(app => ['app-phone', 'app-chat', 'app-localmail', 'app-files', 'app-contacts', 'app-webly-store'].includes(app.id)), [appsList]);
    const ALL_APPS = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);

    const launcherRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);

    const useClickOutside = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
        useEffect(() => {
            const handleClick = (e: MouseEvent) => {
                if (ref.current && !ref.current.contains(e.target as Node)) {
                    callback();
                }
            };
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }, [ref, callback]);
    };

    useClickOutside(launcherRef, () => setLauncherOpen(false));
    useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));
    useClickOutside(settingsMenuRef, () => setSettingsMenuOpen(false));

    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
        setLauncherOpen(false);
    };

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(url, '_blank');
            setSearchQuery('');
            setShowSearch(false);
        }
    };
    
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={`w-screen h-screen overflow-hidden ${(wallpapers[wallpaper] || wallpapers.canyon).class} text-white transition-all duration-500`}>
             {showSearch && (
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center"
                    onClick={() => setShowSearch(false)}
                >
                    <div className="relative w-full max-w-xl" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            placeholder="Search with Google..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            className="w-full bg-slate-800/80 border border-slate-600 text-white rounded-full py-4 pl-6 pr-16 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700">
                             <SearchIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
            {/* Bottom Shelf */}
            <div
                className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto h-24 px-8 rounded-2xl flex items-center justify-center space-x-6 border border-white/20"
                style={{
                    backgroundColor: isDark ? `rgba(20, 25, 40, ${glassTransparency})` : `rgba(255, 255, 255, ${glassTransparency})`,
                    backdropFilter: `blur(${glassBlur}px)`,
                    backgroundImage: 'linear-gradient(to right, #1e293b, #fdba74, #1e293b)',
                }}
            >
                {/* Left controls */}
                <div className="relative">
                    <button onClick={() => setLauncherOpen(p => !p)} className="p-3 rounded-full hover:bg-white/20 transition-colors">
                        <GridIcon className="w-8 h-8"/>
                    </button>
                    {launcherOpen && (
                         <div ref={launcherRef} className="absolute bottom-full mb-4 w-[420px] max-h-[70vh] overflow-y-auto bg-slate-800/80 backdrop-blur-md rounded-xl p-4 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 px-2">All Applications</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {ALL_APPS.map(app => (
                                    <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors space-y-2 text-center">
                                        {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-12 h-12" })}
                                        <span className="text-xs">{app.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Apps */}
                <div className="flex-grow flex items-center justify-center space-x-6">
                    {SHELF_APPS.map(app => (
                        <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center space-y-2 text-white/90 hover:text-white hover:scale-110 transition-transform">
                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-10 h-10" })}
                            <span className="text-sm font-medium">{app.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right controls */}
                 <div className="flex items-center space-x-3">
                    <button onClick={() => setShowSearch(true)} className="p-3 rounded-full hover:bg-white/20 transition-colors"><SearchIcon className="w-6 h-6"/></button>
                    <div className="relative">
                        <button onClick={() => setSettingsMenuOpen(p => !p)} className="p-3 rounded-full hover:bg-white/20 transition-colors">
                            <SettingsIcon className="w-6 h-6"/>
                        </button>
                        {settingsMenuOpen && (
                            <div ref={settingsMenuRef} className="absolute bottom-full right-0 mb-4 w-72 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 animate-fade-in-up space-y-4">
                                <h3 className="text-lg font-semibold">Customize</h3>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Wallpaper</label>
                                  <select value={wallpaper} onChange={e => setWallpaper(e.target.value)} className="w-full p-2 rounded-md bg-slate-700 border border-slate-600 text-sm">
                                      {Object.entries(wallpapers).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}
                                  </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => setProfileMenuOpen(p => !p)} className="p-3 rounded-full hover:bg-white/20 transition-colors">
                            <ProfileIconSvg className="w-6 h-6"/>
                        </button>
                        {profileMenuOpen && (
                             <div ref={profileMenuRef} className="absolute bottom-full right-0 mb-4 w-48 bg-slate-800/80 backdrop-blur-md rounded-xl py-2 animate-fade-in-up">
                                <button onClick={() => { navigate('profile'); setProfileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10">Profile</button>
                                {user?.role === UserRole.Admin && <button onClick={() => { navigate('admin'); setProfileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10">Admin</button>}
                                <div className="border-t border-white/20 my-1"></div>
                                <button onClick={() => { logout(); navigate('home'); }} className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10 text-red-400">Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <div className="fixed bottom-5 right-5 z-50">
                <button 
                    onClick={() => navigate('support')} 
                    className="w-14 h-14 bg-indigo-600 dark:bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors shadow-lg group"
                    aria-label="Help and Support"
                >
                    <HelpIcon />
                </button>
            </div>
        </div>
    );
};

export default FaisConsole;
