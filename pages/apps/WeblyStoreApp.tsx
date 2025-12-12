import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { WeblyApp, UserRole } from '../../types';

const InstallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UninstallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const WeblyStoreApp: React.FC = () => {
    const { user, updateInstalledWeblyApps } = useAuth();
    const [allApps, setAllApps] = useState<WeblyApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            setIsLoading(true);
            const apps = await database.getWeblyApps();
            setAllApps(apps);
            setIsLoading(false);
        };
        fetchApps();
    }, []);

    const handleInstall = (appId: string) => {
        if (!user) return;
        const currentApps = user.installed_webly_apps || [];
        if (!currentApps.includes(appId)) {
            updateInstalledWeblyApps([...currentApps, appId]);
        }
    };
    
    const handleUninstall = (appId: string) => {
        if (!user) return;
        const currentApps = user.installed_webly_apps || [];
        updateInstalledWeblyApps(currentApps.filter(id => id !== appId));
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>;
        }

        if (allApps.length === 0) {
            return <div className="text-center text-gray-400 mt-10"><p>The Webly Store is currently empty.</p></div>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allApps.map(app => {
                    const isInstalled = user?.installed_webly_apps?.includes(app.id);
                    const isGuest = user?.role === UserRole.Trial || user?.role === UserRole.Guest;

                    return (
                        <div key={app.id} className="bg-white/5 dark:bg-black/20 p-5 rounded-xl flex flex-col justify-between shadow-lg border border-white/10 dark:border-black/30">
                            <div>
                                <div className="flex items-center space-x-4 mb-3">
                                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center" dangerouslySetInnerHTML={{ __html: app.icon_svg }} />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{app.name}</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 h-10">{app.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Visit Website</a>
                                {isInstalled ? (
                                    <button 
                                        onClick={() => handleUninstall(app.id)}
                                        disabled={isGuest}
                                        title={isGuest ? "Sign in to manage your apps" : "Uninstall"}
                                        className="px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <UninstallIcon />
                                        <span>Uninstall</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleInstall(app.id)}
                                        disabled={isGuest}
                                        title={isGuest ? "Sign in to manage your apps" : "Install"}
                                        className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <InstallIcon />
                                        <span>{isGuest ? 'Sign in to Install' : 'Install'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full h-full p-8 bg-dark-bg text-light-text dark:text-white flex flex-col">
            <header className="flex-shrink-0 mb-8 text-center">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Webly Store</h1>
                <p className="text-gray-400 mt-2">Discover and install web apps directly to your Lynix console.</p>
            </header>
            <main className="flex-grow overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                {renderContent()}
            </main>
        </div>
    );
};

export default WeblyStoreApp;