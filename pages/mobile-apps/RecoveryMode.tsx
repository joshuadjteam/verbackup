
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Page } from '../../types';

const RebootIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const ShutdownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const VersionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

interface RecoveryModeProps {
    navigate: (page: Page) => void;
    onReboot?: () => void;
}

const RecoveryMode: React.FC<RecoveryModeProps> = ({ navigate, onReboot }) => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'main' | 'version' | 'files' | 'reset_confirm'>('main');
    const [fileStats, setFileStats] = useState<{ count: number, size: string }>({ count: 0, size: '0 KB' });

    useEffect(() => {
        calculateStorage();
    }, []);

    const calculateStorage = () => {
        let totalSize = 0;
        let count = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                count++;
                totalSize += (localStorage[key].length + key.length) * 2;
            }
        }
        setFileStats({
            count,
            size: (totalSize / 1024).toFixed(2) + ' KB'
        });
    };

    const handleReboot = () => {
        if (onReboot) {
            onReboot();
        } else {
            window.location.reload();
        }
    };

    const handleShutdown = () => {
        if (window.confirm("Bye")) {
            // Simulate a crash/shutdown
            document.body.innerHTML = "<div style='background:black;height:100vh;width:100vw;cursor:none;'></div>";
            try {
                window.close();
            } catch (e) {
                // Window close often blocked by browsers, fallback to infinite wait visuals
            }
        }
    };

    const handleReset = () => {
        localStorage.clear();
        logout();
        navigate('signin');
    };

    const MenuButton: React.FC<{ label: string, icon: React.ReactNode, color: string, onClick: () => void }> = ({ label, icon, color, onClick }) => (
        <button 
            onClick={onClick}
            className={`w-full p-4 mb-4 rounded-xl flex items-center space-x-4 transition-transform active:scale-95 border-2 border-transparent hover:border-white/20 ${color}`}
        >
            <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
            <span className="text-lg font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    if (view === 'version') {
        return (
            <div className="w-full h-full bg-[#6a0dad] text-white flex flex-col p-8 font-mono">
                <h1 className="text-2xl font-bold mb-8 border-b-2 border-white/20 pb-4">Version Info</h1>
                <div className="space-y-6 text-sm">
                    <div>
                        <div className="text-purple-300 mb-1">Lynix Version</div>
                        <div className="text-xl font-bold">14.0 Baltecz</div>
                    </div>
                    <div>
                        <div className="text-purple-300 mb-1">Build Number</div>
                        <div className="text-xl">LNX-14.0-250210</div>
                    </div>
                    <div>
                        <div className="text-purple-300 mb-1">Model Number</div>
                        <div className="text-xl">{localStorage.getItem('lynix_device_model') || 'LNX-M1'}</div>
                    </div>
                    <div>
                        <div className="text-purple-300 mb-1">Device Name</div>
                        <div className="text-xl">{localStorage.getItem('lynix_device_name') || 'Generic Mobile'}</div>
                    </div>
                </div>
                <button onClick={() => setView('main')} className="mt-auto bg-white/20 py-3 rounded-lg font-bold">Back</button>
            </div>
        );
    }

    if (view === 'files') {
        return (
            <div className="w-full h-full bg-[#6a0dad] text-white flex flex-col p-8 font-mono">
                <h1 className="text-2xl font-bold mb-8 border-b-2 border-white/20 pb-4">File Usage</h1>
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center mb-6 bg-black/20">
                        <FileIcon />
                    </div>
                    <div className="text-4xl font-bold mb-2">{fileStats.size}</div>
                    <div className="text-purple-300 mb-8">Total Local Storage Used</div>
                    
                    <div className="w-full bg-black/20 p-4 rounded-lg text-left">
                        <div className="flex justify-between mb-2">
                            <span>Total Keys</span>
                            <span className="font-bold">{fileStats.count}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Cookies</span>
                            <span className="font-bold">Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Visit Logs</span>
                            <span className="font-bold">Saved</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setView('main')} className="mt-auto bg-white/20 py-3 rounded-lg font-bold">Back</button>
            </div>
        );
    }

    if (view === 'reset_confirm') {
        return (
            <div className="w-full h-full bg-red-900 text-white flex flex-col p-8 font-mono text-center items-center justify-center">
                <div className="animate-pulse mb-6"><ResetIcon /></div>
                <h1 className="text-3xl font-bold mb-4">Factory Reset?</h1>
                <p className="mb-8">This will wipe all cookies, accounts, settings, and local data. This action cannot be undone.</p>
                <div className="w-full space-y-4">
                    <button onClick={handleReset} className="w-full bg-white text-red-900 font-bold py-4 rounded-xl">Yes, Reset Everything</button>
                    <button onClick={() => setView('main')} className="w-full bg-black/30 text-white font-bold py-4 rounded-xl">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#4b0082] text-white flex flex-col font-mono overflow-hidden">
            <div className="p-8 flex-grow flex flex-col">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
                        <div className="text-3xl font-bold">14</div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-widest">LYNIX RECOVERY</h1>
                    <p className="text-purple-300 text-xs mt-1">v14.0 (Baltecz)</p>
                </div>

                <div className="space-y-2">
                    <MenuButton label="Reboot System" icon={<RebootIcon />} color="bg-blue-600 hover:bg-blue-500" onClick={handleReboot} />
                    <MenuButton label="Shutdown" icon={<ShutdownIcon />} color="bg-red-600 hover:bg-red-500" onClick={handleShutdown} />
                    <MenuButton label="Factory Reset" icon={<ResetIcon />} color="bg-orange-600 hover:bg-orange-500" onClick={() => setView('reset_confirm')} />
                    <MenuButton label="Version Info" icon={<VersionIcon />} color="bg-purple-600 hover:bg-purple-500" onClick={() => setView('version')} />
                    <MenuButton label="File Usage" icon={<FileIcon />} color="bg-teal-600 hover:bg-teal-500" onClick={() => setView('files')} />
                </div>
            </div>
            <div className="bg-black/30 p-2 text-center text-[10px] text-purple-300">
                DOZIAN-KERNEL-RECOVERY-IMG-SIGNED
            </div>
        </div>
    );
};

export default RecoveryMode;
