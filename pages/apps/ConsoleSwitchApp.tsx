
import React from 'react';
import { useConsoleView } from '../../hooks/useConsoleView';
import { Page } from '../../types';

const SynoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const FaisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;
const LegaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;
const ConIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const WinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" /></svg>;
const MacIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.08-3.11-1.06.05-2.31.71-3.06 1.61-.69.82-1.27 2.08-1.09 3.15 1.18.09 2.35-.82 3.07-1.65"/></svg>;
const CosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>;

interface ConsoleSwitchAppProps {
    closeWindow?: () => void;
    navigate?: (page: Page) => void;
}

const ConsoleSwitchApp: React.FC<ConsoleSwitchAppProps> = ({ closeWindow, navigate }) => {
    const { view, setConsoleView } = useConsoleView();

    const consoles = [
        { id: 'syno', name: 'SynoConsole', description: 'A modern console that looks and feels like a desktop OS.', icon: <SynoIcon /> },
        { id: 'fais', name: 'FaisConsole', description: 'An all-in-one console with a prominent bottom application shelf.', icon: <FaisIcon /> },
        { id: 'lega', name: 'LegaLauncher', description: 'A classic launcher with a simple top bar and a familiar home screen background.', icon: <LegaIcon /> },
        { id: 'con', name: 'ConConsole', description: 'A modern, widget-based dashboard for quick access to apps and actions.', icon: <ConIcon /> },
        { id: 'win', name: 'WinLauncher', description: 'A Windows look-alike launcher with settings, backgrounds, and systems colour theme.', icon: <WinIcon /> },
        { id: 'mac', name: 'MacLaunch', description: 'A MacOS look-alike launcher with a dock, top bar, and apps such as system preference.', icon: <MacIcon /> },
        { id: 'cos', name: 'COSlaunch', description: 'A ChromeOS 142.0.7444.181 lookalike with settings to manage everything.', icon: <CosIcon /> },
    ];

    const handleSelect = (newView: any) => {
        setConsoleView(newView);
        if (closeWindow) {
            closeWindow();
        }
        if (navigate) {
            navigate('home');
        }
    };

    return (
        <div className="w-full h-full p-8 sm:p-12 bg-dark-bg text-light-text dark:text-white flex flex-col justify-center overflow-y-auto">
             <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-center">Console Switcher</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-10 text-center text-lg">Choose your preferred console experience.</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {consoles.map(c => (
                        <div key={c.id} className={`p-6 rounded-lg border-2 flex flex-col h-full transition-all ${view === c.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 dark:border-slate-700 bg-black/5 dark:bg-black/20'}`}>
                            <div className="flex items-center space-x-4 mb-4">
                                {c.icon}
                                <h2 className="text-xl font-semibold truncate">{c.name}</h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">{c.description}</p>
                            <button
                                onClick={() => handleSelect(c.id)}
                                disabled={view === c.id}
                                className="w-full mt-auto py-2 px-4 rounded-md font-semibold transition-colors disabled:bg-blue-600 disabled:text-white disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 hover:bg-blue-500 hover:text-white"
                            >
                                {view === c.id ? 'Currently Active' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConsoleSwitchApp;
