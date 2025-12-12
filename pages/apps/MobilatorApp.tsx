
import React, { useState, useEffect, useMemo } from 'react';
import { Page, AppLaunchable, UserRole, WeblyApp } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import MobiLauncher from '../MobiLauncher';
import MobiProfilePage from '../mobile-apps/MobiProfilePage';
import MobiPhoneApp from '../mobile-apps/MobiPhoneApp';
import MobiChatApp from '../mobile-apps/MobiChatApp';
import MobiLocalMailApp from '../mobile-apps/MobiLocalMailApp';
import MobiContactsApp from '../mobile-apps/MobiContactsApp';
import MobiNotepadApp from '../mobile-apps/MobiNotepadApp';
import MobiCalculatorApp from '../mobile-apps/MobiCalculatorApp';
import MobiPaintApp from '../mobile-apps/MobiPaintApp';
import MobiFileExplorerApp from '../mobile-apps/MobiFileExplorerApp';
import MobiEditorApp from '../mobile-apps/MobiEditorApp';
import MobiUnitConverterApp from '../mobile-apps/MobiUnitConverterApp';
import MobiCalendarApp from '../mobile-apps/MobiCalendarApp';
import MobiConsoleSwitchApp from '../mobile-apps/MobiConsoleSwitchApp';
import MobiWeblyStoreApp from '../mobile-apps/MobiWeblyStoreApp';
import MobiWebAppViewer from '../mobile-apps/MobiWebAppViewer';
import MobiLynixBrowserApp from '../mobile-apps/MobiLynixBrowserApp';
import MobiHelpApp from '../mobile-apps/MobiHelpApp';
import MobiCameraApp from '../mobile-apps/MobiCameraApp';
import MobiSettingsApp from '../mobile-apps/MobiSettingsApp';
import MobiMapsApp from '../mobile-apps/MobiMapsApp';
import MobiMusicApp from '../mobile-apps/MobiMusicApp';
import MobiGalleryApp from '../mobile-apps/MobiGalleryApp';
import MobiModderApp from '../mobile-apps/MobiModderApp';
import LegacyLauncher from '../mobile-apps/LegacyLauncher';
import OneUILauncher from '../mobile-apps/OneUILauncher';
import BB10Launcher from '../mobile-apps/BB10Launcher';
import RecoveryMode from '../mobile-apps/RecoveryMode';
import MobileTopBar from '../../components/MobileTopBar';
import MobileNavBar from '../../components/MobileNavBar';
import MobileBootScreen from '../../components/MobileBootScreen';
import { APPS_LIST, APPS_MAP } from '../../App';

const DriveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const LoadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4-4v12" /></svg>;

const MOBILATOR_PAGES_MAP: Record<string, React.FC<any>> = {
    'home': MobiLauncher,
    'profile': MobiProfilePage,
    'contact': MobiHelpApp, 
    'support': MobiHelpApp,
    'app-phone': MobiPhoneApp,
    'app-chat': MobiChatApp,
    'app-localmail': MobiLocalMailApp,
    'app-contacts': MobiContactsApp,
    'app-notepad': MobiNotepadApp,
    'app-calculator': MobiCalculatorApp,
    'app-paint': MobiPaintApp,
    'app-files': MobiFileExplorerApp,
    'app-editor': MobiEditorApp,
    'app-converter': MobiUnitConverterApp,
    'app-calendar': MobiCalendarApp,
    'app-console-switch': MobiConsoleSwitchApp,
    'app-webly-store': MobiWeblyStoreApp,
    'mobi-app-webview': MobiWebAppViewer,
    'app-webview': MobiWebAppViewer, 
    'app-browser': MobiLynixBrowserApp, 
    'app-help': MobiHelpApp,
    'app-camera': MobiCameraApp,
    'app-settings': MobiSettingsApp,
    'app-maps': MobiMapsApp,
    'app-music': MobiMusicApp,
    'app-gallery': MobiGalleryApp,
    'app-modder': MobiModderApp,
    'recovery-mode': RecoveryMode,
};

interface MobilatorAppProps {
    navigate: (page: Page, params?: any) => void;
}

const MobilatorApp: React.FC<MobilatorAppProps> = ({ navigate: globalNavigate }) => {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [pageParams, setPageParams] = useState<any>({});
    const [status, setStatus] = useState('');
    const [isDriveLinked, setIsDriveLinked] = useState(false);
    const [allWeblyApps, setAllWeblyApps] = useState<WeblyApp[]>([]);
    const [isBooting, setIsBooting] = useState(false);
    const [launcherStyle, setLauncherStyle] = useState('pixel');

    useEffect(() => {
        database.isDriveLinked().then(setIsDriveLinked);
        database.getWeblyApps().then(setAllWeblyApps);
        
        // Load initial launcher preference
        const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
        setLauncherStyle(mods.launcherStyle || 'pixel');
    }, []);

    // Local navigation function for inside the emulator
    const emulatorNavigate = (page: Page, params: any = {}) => {
        setCurrentPage(page);
        setPageParams(params);
    };

    // Soft Reboot Function exposed to internal apps
    const handleSoftReboot = () => {
        setIsBooting(true);
        // Reset state while screen is hidden by boot animation
        setCurrentPage('home');
        setPageParams({});
    };

    const handleBootComplete = () => {
        setIsBooting(false);
        // Refresh launcher preference from storage in case it changed
        const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
        setLauncherStyle(mods.launcherStyle || 'pixel');
    };

    // Sync Logic
    const handleSaveToDrive = async () => {
        if (!isDriveLinked) { setStatus('Drive not linked.'); return; }
        setStatus('Saving...');
        
        const dataToSave: any = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('lynix_')) {
                dataToSave[key] = localStorage.getItem(key);
            }
        }
        
        const fileName = 'mobilator_backup.json';
        const content = JSON.stringify(dataToSave);
        
        const existingFile = await database.findDriveFileByName(fileName);
        if (existingFile) {
            await database.updateDriveFile(existingFile.id, { content });
        } else {
            const { file } = await database.createDriveFile(fileName);
            if (file) await database.updateDriveFile(file.id, { content });
        }
        
        setStatus('Saved to Drive!');
        setTimeout(() => setStatus(''), 3000);
    };

    const handleLoadFromDrive = async () => {
        if (!isDriveLinked) { setStatus('Drive not linked.'); return; }
        setStatus('Loading...');
        
        const fileName = 'mobilator_backup.json';
        const existingFile = await database.findDriveFileByName(fileName);
        
        if (existingFile) {
            const { file } = await database.getDriveFileDetails(existingFile.id);
            if (file && file.content) {
                try {
                    const data = JSON.parse(file.content);
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, data[key]);
                    });
                    setStatus('Data loaded! Rebooting...');
                    
                    setTimeout(() => {
                        handleSoftReboot();
                    }, 1000);

                } catch (e) {
                    setStatus('Error parsing data.');
                }
            }
        } else {
            setStatus('No backup found.');
        }
        setTimeout(() => setStatus(''), 3000);
    };

    // Determine Component to Render
    let CurrentComponent = MOBILATOR_PAGES_MAP[currentPage] || MobiLauncher;

    // Override 'home' with specific launcher based on version and mods
    if (currentPage === 'home') {
        const version = user?.system_version || '12.0.2';
        if (version.startsWith('10')) {
            CurrentComponent = LegacyLauncher;
        } else if (version === '14.0') {
            if (launcherStyle === 'oneui') CurrentComponent = OneUILauncher;
            else if (launcherStyle === 'bb10') CurrentComponent = BB10Launcher;
            else CurrentComponent = MobiLauncher; // Default Pixel
        } else {
            CurrentComponent = MobiLauncher;
        }
    }

    // Filter apps for the emulator
    const dynamicAppsList = useMemo(() => {
        const coreApps = APPS_LIST;
        let availableApps: AppLaunchable[] = coreApps;

        const currentVersion = user?.system_version || '12.0.2';
        const isDevMode = localStorage.getItem('lynix_developer_mode') === 'true';

        if (currentVersion.startsWith('10')) {
            availableApps = availableApps.filter(app => ['app-phone', 'app-chat', 'app-contacts', 'app-localmail', 'app-settings', 'app-help', 'app-camera', 'app-browser'].includes(app.id));
        } else if (currentVersion === '12.0.2') {
            availableApps = availableApps.filter(app => !['app-webly-store', 'app-maps', 'app-music', 'app-gallery', 'app-modder', 'app-mobilator'].includes(app.id));
        } else if (currentVersion === '12.5') {
            availableApps = availableApps.filter(app => !['app-maps', 'app-music', 'app-gallery', 'app-modder'].includes(app.id));
        } else if (currentVersion === '13.0') {
            availableApps = availableApps.filter(app => app.id !== 'app-modder');
        } else if (currentVersion === '14.0') {
            if (isDevMode) {
                availableApps = availableApps.map(app => app.id === 'app-modder' ? { ...app, isHidden: false } : app);
            }
        }

        if (user?.installed_webly_apps && allWeblyApps.length > 0) {
             const installedApps: AppLaunchable[] = user.installed_webly_apps
                .map((appId): AppLaunchable | null => {
                    const appData = allWeblyApps.find(app => app.id === appId);
                    if (!appData) return null;
                    const isNative = !!APPS_MAP[appData.id];
                    return {
                        id: appData.id,
                        label: appData.name,
                        icon: <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: appData.icon_svg }} />,
                        page: isNative ? (appData.id as Page) : 'mobi-app-webview',
                        isWebApp: !isNative,
                        url: appData.url,
                        load_in_console: appData.load_in_console,
                        params: isNative ? {} : { url: appData.url, title: appData.name, isWebApp: true, iconSvg: appData.icon_svg } 
                    };
                })
                .filter((app): app is AppLaunchable => app !== null);
            availableApps = [...availableApps, ...installedApps];
        }

        if (user) {
            if (user.role === UserRole.Overdue) return availableApps.filter(app => ['profile', 'contact', 'support', 'app-console-switch', 'app-help'].includes(app.id));
            if (user.role === UserRole.NoChat) availableApps = availableApps.filter(app => app.id !== 'app-chat');
            if (user.role === UserRole.NoStore) availableApps = availableApps.filter(app => { if (app.id === 'app-webly-store') return false; if (app.id === 'profile' || app.id === 'app-help' || app.id === 'app-camera' || app.id === 'app-settings') return true; if (app.isWebApp) return false; return true; });
            if (user.role === UserRole.NoMail) availableApps = availableApps.filter(app => app.id !== 'app-localmail');
            if (user.role === UserRole.NoTelephony) availableApps = availableApps.filter(app => app.id !== 'app-phone');
        }
        return availableApps;
    }, [user, allWeblyApps]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] relative overflow-hidden">
            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-10">
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs mb-2 shadow-lg">
                    {status || (isDriveLinked ? 'Drive Connected' : 'Drive Not Connected')}
                </div>
                <button onClick={handleSaveToDrive} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isDriveLinked}>
                    <SaveIcon />
                    <span>Save State</span>
                </button>
                <button onClick={handleLoadFromDrive} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isDriveLinked}>
                    <LoadIcon />
                    <span>Load State</span>
                </button>
                <button onClick={handleSoftReboot} className="flex items-center space-x-2 bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow-lg transition-colors border border-red-600/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>Soft Reboot</span>
                </button>
            </div>

            <div className="absolute top-4 left-4 text-gray-500">
                <h1 className="text-2xl font-bold">Mobilator</h1>
                <p className="text-xs">Lynix Mobile Emulator</p>
            </div>

            {/* Phone Frame */}
            <div className="relative w-[360px] h-[740px] bg-black rounded-[3rem] border-[8px] border-[#333] shadow-2xl overflow-hidden ring-4 ring-black">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-50"></div>
                
                {/* Screen Content */}
                <div className="w-full h-full bg-white dark:bg-black relative overflow-hidden flex flex-col">
                    {isBooting ? (
                        <MobileBootScreen onComplete={handleBootComplete} />
                    ) : (
                        <>
                            <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
                                <div className="pointer-events-auto">
                                    <MobileTopBar navigate={emulatorNavigate} onSleep={() => {}} />
                                </div>
                            </div>
                            
                            <main className="flex-grow relative w-full h-full overflow-hidden pt-8 pb-12">
                                {/* Pass onReboot to apps that support it */}
                                <CurrentComponent navigate={emulatorNavigate} appsList={dynamicAppsList} {...pageParams} onReboot={handleSoftReboot} />
                            </main>

                            <div className="absolute bottom-0 left-0 right-0 z-50">
                                <MobileNavBar navigate={emulatorNavigate} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobilatorApp;
