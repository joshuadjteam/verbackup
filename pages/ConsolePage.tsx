import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Page, UserRole, AppLaunchable, NavAction } from '../types';
import { useTheme, wallpapers } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import HelpModal from '../components/HelpModal';

// --- Icons (Imported or passed, no local definitions) ---
const GridIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProfileIconSvg = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AdminIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const LightIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DarkIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SignOutIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ContactIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface ConsolePageProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const ConsolePage: React.FC<ConsolePageProps> = ({ navigate, appsList }) => {
    const { user, logout } = useAuth();
    const { isDark, setIsDark, glassBlur, setGlassBlur, glassTransparency, setGlassTransparency, wallpaper, setWallpaper } = useTheme();
    
    const [launcherOpen, setLauncherOpen] = useState(false);
    const [webMenuOpen, setWebMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);

    const ALL_APPS = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);
    const DESKTOP_APPS = useMemo(() => appsList.filter(app => ['app-files', 'app-localmail', 'app-chat', 'app-contacts', 'app-console-switch', 'app-webly-store'].includes(app.id)), [appsList]);

    const launcherRef = useRef<HTMLDivElement>(null);
    const webMenuRef = useRef<HTMLDivElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
    useClickOutside(webMenuRef, () => setWebMenuOpen(false));
    useClickOutside(settingsMenuRef, () => setSettingsMenuOpen(false));
    
    const handleAppClick = (app: AppLaunchable | NavAction) => {
      if ('action' in app) {
          switch (app.action) {
              case 'navigate':
                  navigate(app.page, app.params);
                  break;
              case 'logout':
                  logout();
                  navigate('home');
                  break;
          }
      } else {
          navigate(app.page, { ...app.params, appData: app });
      }
      setLauncherOpen(false);
      setSettingsMenuOpen(false);
      setWebMenuOpen(false);
    };

    const formattedTime = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const formattedDate = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div className={`w-screen h-screen overflow-hidden ${(wallpapers[wallpaper] || wallpapers.canyon).class} text-white transition-all duration-500`}>
            {/* Desktop Area for Icons */}
            <div className="absolute inset-0 top-12 p-4">
                <div className="grid grid-cols-10 gap-4">
                    {DESKTOP_APPS.map(app => (
                         <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors space-y-2 text-center w-24 h-24">
                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-12 h-12" })}
                            <span className="text-sm font-medium text-shadow" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{app.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Top Bar */}
            <div 
                className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-3 border-b border-white/10"
                style={{
                    backgroundColor: isDark 
                        ? `rgba(20, 25, 40, ${glassTransparency})` 
                        : `rgba(255, 255, 255, ${glassTransparency})`,
                    backdropFilter: `blur(${glassBlur}px)`
                }}
            >
                {/* Left Controls */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <button onClick={() => setLauncherOpen(p => !p)} className="p-2 rounded-md hover:bg-white/20 transition-colors">
                            <GridIcon className="w-6 h-6"/>
                        </button>
                        {launcherOpen && (
                            <div ref={launcherRef} className="absolute top-full mt-2 w-96 max-h-[70vh] overflow-y-auto bg-slate-800/80 backdrop-blur-md rounded-xl p-4 animate-fade-in-up">
                                <h3 className="text-xl font-bold mb-4 px-2">All Applications</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {ALL_APPS.map(app => (
                                        <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors space-y-2 text-center">
                                            {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-10 h-10" })}
                                            <span className="text-xs">{app.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="relative">
                        <button onClick={() => setWebMenuOpen(p => !p)} className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-white/20 transition-colors">Web</button>
                        {webMenuOpen && (
                            <div ref={webMenuRef} className="absolute top-full mt-2 w-48 bg-slate-800/80 backdrop-blur-md rounded-xl py-2 animate-fade-in-up">
                               <a href="https://darshanjoshuakesavaruban.fwscheckout.com/" target="_blank" rel="noopener noreferrer" className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10">Buy A Product</a>
                               <a href="https://sites.google.com/gcp.lynixity.x10.bz/myportal/home" target="_blank" rel="noopener noreferrer" className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10">MyPortal</a>
                               <div className="border-t border-white/20 my-1"></div>
                               <button onClick={() => navigate('contact')} className="w-full text-left flex items-center px-4 py-2 hover:bg-white/10 space-x-3"><ContactIcon className="w-5 h-5"/><span>Contact</span></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-3">
                    <div className="text-right text-xs leading-tight font-medium">
                        <div>{formattedTime}</div>
                        <div>{formattedDate}</div>
                    </div>
                    <div className="relative">
                        <button onClick={() => setSettingsMenuOpen(p => !p)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <SettingsIcon className="w-6 h-6"/>
                        </button>
                         {settingsMenuOpen && (
                            <div ref={settingsMenuRef} className="absolute top-full right-0 mt-2 w-72 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 animate-fade-in-up space-y-4">
                                <h3 className="text-lg font-semibold">Settings</h3>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Wallpaper</label>
                                  <select value={wallpaper} onChange={e => setWallpaper(e.target.value)} className="w-full p-2 rounded-md bg-slate-700 border border-slate-600 text-sm">
                                      {Object.entries(wallpapers).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Glass Blur: {glassBlur}px</label>
                                  <input type="range" min="0" max="24" value={glassBlur} onChange={e => setGlassBlur(Number(e.target.value))} className="w-full" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Glass Transparency: {Math.round(glassTransparency * 100)}%</label>
                                  <input type="range" min="0.1" max="1" step="0.05" value={glassTransparency} onChange={e => setGlassTransparency(Number(e.target.value))} className="w-full" />
                                </div>
                                <div className="border-t border-white/20 my-1 pt-2">
                                  <button onClick={() => handleAppClick({ page: 'profile', action: 'navigate' })} className="w-full text-left flex items-center px-2 py-2 hover:bg-white/10 rounded-md space-x-3 text-sm"><ProfileIconSvg className="w-5 h-5"/><span>Profile</span></button>
                                  {user?.role === UserRole.Admin && <button onClick={() => handleAppClick({ page: 'admin', action: 'navigate' })} className="w-full text-left flex items-center px-2 py-2 hover:bg-white/10 rounded-md space-x-3 text-sm"><AdminIcon className="w-5 h-5"/><span>Admin Portal</span></button>}
                                  <button onClick={() => setIsDark(!isDark)} className="w-full text-left flex items-center px-2 py-2 hover:bg-white/10 rounded-md space-x-3 text-sm">{isDark ? <LightIcon className="w-5 h-5"/> : <DarkIcon className="w-5 h-5"/>}<span>{isDark ? 'Light' : 'Dark'} Mode</span></button>
                                  <button onClick={() => handleAppClick({ page: 'home', action: 'logout' })} className="w-full text-left flex items-center px-2 py-2 hover:bg-white/10 text-red-400 rounded-md space-x-3 text-sm"><SignOutIcon className="w-5 h-5"/><span>Sign Out</span></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="fixed bottom-5 right-5 z-50">
                <button 
                    onClick={() => setHelpModalOpen(true)} 
                    className="w-14 h-14 bg-indigo-600 dark:bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors shadow-lg group"
                    aria-label="Help and Support"
                >
                    <HelpIcon />
                </button>
            </div>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
        </div>
    );
};

export default ConsolePage;