
import React, { useState, useEffect, useRef } from 'react';
import { Page, UserRole, AppLaunchable } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import HelpModal from '../components/HelpModal';

// --- Icon Components ---
const WebIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>;
const AppsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ContactIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HomeIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProfileIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AdminIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const LightIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DarkIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SignOutIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const YoutubeIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// A simple clock for the LegaLauncher style
const LegaClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeString = time.toLocaleTimeString('en-US');
    const dateString = time.toLocaleDateString('en-US');

    return (
        <p className="font-mono text-lg tracking-wider">
            {timeString} / {dateString}
        </p>
    );
};

interface LegaLauncherProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const LegaLauncher: React.FC<LegaLauncherProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { isDark, setIsDark, wallpaper } = useTheme();

    const [webMenuOpen, setWebMenuOpen] = useState(false);
    const [appsMenuOpen, setAppsMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const webMenuRef = useRef<HTMLDivElement>(null);
    const appsMenuRef = useRef<HTMLDivElement>(null);
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

    useClickOutside(webMenuRef, () => setWebMenuOpen(false));
    useClickOutside(appsMenuRef, () => setAppsMenuOpen(false));
    useClickOutside(settingsMenuRef, () => setSettingsMenuOpen(false));
    
    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
        setAppsMenuOpen(false);
    };

    const handleSignOut = () => {
        logout();
        setSettingsMenuOpen(false);
        navigate('home');
    };

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(url, '_blank');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const NavButton: React.FC<{ onClick?: () => void, text: string, icon: React.ReactNode }> = ({ onClick, text, icon }) => (
        <button onClick={onClick} className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-white/10">
            {icon}
            <span>{text}</span>
        </button>
    );

    return (
        <div className={`w-screen h-screen overflow-hidden flex flex-col text-white ${(wallpapers[wallpaper] || wallpapers.canyon).class} font-sans select-none transition-all duration-500`}>
            {/* Top Navigation Bar */}
            <div className="h-14 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 shadow-sm z-50">
                <div className="flex items-center space-x-2">
                    <div className="relative" ref={appsMenuRef}>
                        <NavButton onClick={() => setAppsMenuOpen(!appsMenuOpen)} text="Apps" icon={<AppsIcon />} />
                        {appsMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-2 animate-fade-in-up overflow-y-auto max-h-[80vh] z-50">
                                {appsList.filter(app => !app.isHidden).map(app => (
                                    <button key={app.id} onClick={() => handleAppClick(app)} className="w-full flex items-center space-x-3 p-2 hover:bg-white/10 rounded-md transition-colors text-left">
                                        {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                                        <span className="text-sm">{app.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={webMenuRef}>
                        <NavButton onClick={() => setWebMenuOpen(!webMenuOpen)} text="Web" icon={<WebIcon />} />
                        {webMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-2 animate-fade-in-up z-50">
                                <a href="https://darshanjoshuakesavaruban.fwscheckout.com/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm transition-colors">Buy A Product</a>
                                <a href="https://sites.google.com/gcp.lynixity.x10.bz/myportal/home" target="_blank" rel="noopener noreferrer" className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm transition-colors">MyPortal</a>
                                <div className="border-t border-white/10 my-1"></div>
                                <button onClick={() => navigate('contact')} className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm space-x-2 transition-colors">
                                    <ContactIcon /><span>Contact</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Search */}
                <div className="hidden md:flex relative w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-gray-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search Google..."
                        className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-white/10 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:text-white sm:text-sm transition-all duration-300"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:block text-right text-gray-300">
                        <LegaClock />
                    </div>
                    <div className="relative" ref={settingsMenuRef}>
                        <button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <SettingsIcon />
                        </button>
                        {settingsMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-2 animate-fade-in-up z-50">
                                <div className="px-4 py-2 border-b border-white/10 mb-2">
                                    <p className="font-bold text-white">{user?.username}</p>
                                    <p className="text-xs text-gray-400">{user?.email}</p>
                                </div>
                                <button onClick={() => { navigate('profile'); setSettingsMenuOpen(false); }} className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm space-x-3 transition-colors">
                                    <ProfileIcon /><span>Profile</span>
                                </button>
                                {user?.role === UserRole.Admin && (
                                    <button onClick={() => { navigate('admin'); setSettingsMenuOpen(false); }} className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm space-x-3 transition-colors">
                                        <AdminIcon /><span>Admin Portal</span>
                                    </button>
                                )}
                                <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center px-3 py-2 hover:bg-white/10 rounded-md text-sm space-x-3 transition-colors">
                                    {isDark ? <LightIcon /> : <DarkIcon />}<span>{isDark ? 'Light' : 'Dark'} Mode</span>
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                <button onClick={handleSignOut} className="w-full flex items-center px-3 py-2 hover:bg-red-500/20 text-red-400 rounded-md text-sm space-x-3 transition-colors">
                                    <SignOutIcon /><span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col items-center justify-center p-8 relative">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl tracking-tight">Welcome Home</h1>
                    <p className="text-xl text-gray-200 drop-shadow-md max-w-2xl mx-auto">
                        Your personalized workspace for productivity and creativity.
                    </p>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {appsList.filter(app => ['app-files', 'app-browser', 'app-localmail', 'app-chat'].includes(app.id)).map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => handleAppClick(app)}
                            className="flex flex-col items-center space-y-4 group transition-transform duration-300 hover:scale-110"
                        >
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-xl border border-white/10 group-hover:bg-white/20 transition-colors">
                                {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-10 h-10 text-white" })}
                            </div>
                            <span className="text-sm font-medium text-white drop-shadow-md group-hover:text-white/90">{app.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 right-6 flex items-center space-x-6 text-white/60 text-sm z-40">
                <a href="https://www.youtube.com/@DarCodR" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-2">
                    <YoutubeIcon /><span>YouTube</span>
                </a>
                <button onClick={() => setHelpModalOpen(true)} className="hover:text-white transition-colors flex items-center space-x-2">
                    <HelpIcon /><span>Help</span>
                </button>
            </div>
            
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
        </div>
    );
};

export default LegaLauncher;
