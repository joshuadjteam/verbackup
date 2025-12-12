import React, { useState, useMemo } from 'react';
import { Page, AppLaunchable } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme, wallpapers } from '../hooks/useTheme';
import Clock from '../components/Clock';
import HelpModal from '../components/HelpModal';
import AppContainer from '../components/AppContainer';

// Icons
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ConsoleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;


const FEATURED_APPS = ['app-phone', 'app-chat', 'app-contacts', 'app-localmail', 'app-notepad', 'app-editor'];
const APP_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'];

interface ConConsoleProps {
    navigate: (page: Page, params?: any) => void;
    appsList: AppLaunchable[];
}

const ConConsole: React.FC<ConConsoleProps> = ({ navigate, appsList }) => {
    const { user } = useAuth();
    const { wallpaper } = useTheme();
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const featuredApps = useMemo(() => FEATURED_APPS.map(id => appsList.find(app => app.id === id)).filter(Boolean) as AppLaunchable[], [appsList]);
    const allApps = useMemo(() => appsList.filter(app => !app.isHidden), [appsList]);
    
    const handleAppClick = (app: AppLaunchable) => {
        navigate(app.page, { ...app.params, appData: app });
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
        <div className={`w-screen h-screen overflow-hidden flex flex-col text-white ${(wallpapers[wallpaper] || wallpapers.canyon).class}`}>
            {showSearch && (
                 <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center"
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
             {/* Header */}
            <header className="w-full bg-slate-900/50 text-white shadow-lg z-10 flex-shrink-0">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('home')}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="11" fill="#4A5568"/>
                            <path d="M15.9042 7.15271C14.4682 6.42517 12.8251 6 11.0625 6C7.16117 6 4 9.13401 4 13C4 16.866 7.16117 20 11.0625 20C12.8251 20 14.4682 19.5748 15.9042 18.8473" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8.09583 16.8473C9.53181 17.5748 11.1749 18 12.9375 18C16.8388 18 20 14.866 20 11C20 7.13401 16.8388 4 12.9375 4C11.1749 4 9.53181 4.42517 8.09583 5.15271" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-2xl font-bold text-white">Lynix</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => navigate('contact')} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-white/20"><ContactIcon/><span>Contact</span></button>
                        <button onClick={() => navigate('home')} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-white/20"><ConsoleIcon/><span>Console</span></button>
                        <button onClick={() => navigate('profile')} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-white/20"><SettingsIcon/><span>Settings</span></button>
                        <button onClick={() => navigate('profile')} className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold hover:bg-blue-600">{user?.username.charAt(0).toUpperCase()}</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="col-span-8 space-y-6">
                        <div className="grid grid-cols-6 gap-6">
                            <AppContainer overrideBg className="col-span-2 p-4 flex flex-col items-center justify-center">
                                <CalendarIconSmall/>
                                <Clock/>
                            </AppContainer>
                            {featuredApps.map((app, i) => (
                                <button key={app.id} onClick={() => handleAppClick(app)} className={`col-span-2 h-32 rounded-2xl flex flex-col items-center justify-center space-y-2 text-white font-semibold text-lg transition-transform hover:scale-105 ${APP_COLORS[i % APP_COLORS.length]}`}>
                                    {React.cloneElement(app.icon as React.ReactElement<any>, { className: 'w-10 h-10' })}
                                    <span>{app.label}</span>
                                </button>
                            ))}
                        </div>
                        <AppContainer className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-white">All Apps</h2>
                            <div className="grid grid-cols-6 gap-4">
                               {allApps.map(app => (
                                   <button key={app.id} onClick={() => handleAppClick(app)} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors space-y-2 text-center">
                                       {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-10 h-10" })}
                                       <span className="text-xs text-white/90">{app.label}</span>
                                   </button>
                               ))}
                            </div>
                        </AppContainer>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-4 space-y-4">
                        <button onClick={() => setShowSearch(true)} className="w-full h-20 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors">Search with Google</button>
                        <button onClick={() => navigate('app-chat', { initialTargetId: -1, title: 'LynxAI' })} className="w-full h-20 rounded-2xl text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-colors">Chat with AI</button>
                        <button onClick={() => window.open('https://darshanjoshuakesavaruban.fwscheckout.com/', '_blank')} className="w-full h-20 rounded-2xl text-lg font-semibold bg-green-600 hover:bg-green-700 transition-colors">Buy another product!</button>
                        <button onClick={() => window.open('https://sites.google.com/gcp.lynixity.x10.bz/myportal/home', '_blank')} className="w-full h-20 rounded-2xl text-lg font-semibold bg-orange-600 hover:bg-orange-700 transition-colors">MyPortal</button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-green-800/80 text-green-100 text-sm py-3 flex-shrink-0 relative">
                <div className="container mx-auto px-4 flex justify-center items-center space-x-4">
                    <p>&copy; 2025 Lynix Technology and Coding. All Rights Reserved.</p>
                    <div className="w-px h-4 bg-green-300"></div>
                    <a href="https://www.youtube.com/@DarCodR" target="_blank" rel="noopener noreferrer" className="hover:text-white font-semibold transition-colors flex items-center space-x-1"><YoutubeIcon/><span>YouTube</span></a>
                </div>
                <button onClick={() => setHelpModalOpen(true)} className="absolute right-5 bottom-2 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-lg -translate-y-1/3"><HelpIcon/></button>
            </footer>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
        </div>
    );
};

export default ConConsole;