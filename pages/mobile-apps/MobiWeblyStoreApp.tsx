import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { WeblyApp, UserRole } from '../../types';
import { Page } from '../../types';

const InstallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UninstallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiWeblyStoreAppProps {
    navigate: (page: Page) => void;
}


const MobiWeblyStoreApp: React.FC<MobiWeblyStoreAppProps> = ({ navigate }) => {
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
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div></div>;
        }

        if (allApps.length === 0) {
            return <div className="text-center text-gray-400 mt-10"><p>The Webly Store is currently empty.</p></div>;
        }

        return (
            <div className="space-y-4">
                {allApps.map(app => {
                    const isInstalled = user?.installed_webly_apps?.includes(app.id);
                    const isGuest = user?.role === UserRole.Trial || user?.role === UserRole.Guest;

                    return (
                        <div key={app.id} className="bg-white/5 dark:bg-black/20 p-4 rounded-xl flex flex-col shadow-lg border border-white/10 dark:border-black/30">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center" dangerouslySetInnerHTML={{ __html: app.icon_svg }} />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{app.name}</h3>
                                    <p className="text-xs text-gray-300">{app.description}</p>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-end">
                                {isInstalled ? (
                                    <button 
                                        onClick={() => handleUninstall(app.id)}
                                        disabled={isGuest}
                                        className="px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center disabled:bg-gray-500 disabled:opacity-50"
                                    >
                                        <UninstallIcon />
                                        <span>Uninstall</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleInstall(app.id)}
                                        disabled={isGuest}
                                        className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center disabled:bg-gray-500 disabled:opacity-50"
                                    >
                                        <InstallIcon />
                                        <span>Install</span>
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
        <div className="w-full h-full p-4 bg-dark-bg text-light-text dark:text-white flex flex-col">
            <header className="flex-shrink-0 mb-4 text-center">
                 <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Webly Store</h1>
                <p className="text-gray-400 mt-1 text-sm">Install web apps to your launcher.</p>
            </header>
            <main className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {renderContent()}
            </main>
        </div>
    );
};

export default MobiWeblyStoreApp;
