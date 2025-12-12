import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, wallpapers } from '../../hooks/useTheme';
import { Page } from '../../types';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5a2 2 0 002-2v-6.5a2 2 0 00-2-2H7" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface SettingsAppProps {
    navigate: (page: Page) => void;
}

const SettingsApp: React.FC<SettingsAppProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const { wallpaper, setWallpaper } = useTheme();
    const [view, setView] = useState<'main' | 'wallpaper' | 'security' | 'about'>('main');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (user) {
            const storedPin = localStorage.getItem(`lynix_pin_${user.id}`);
            if (storedPin) {
                setStatus('PIN is set');
            }
        }
    }, [user]);

    const handleSetPin = () => {
        if (pin.length !== 4) {
            setStatus('PIN must be 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            setStatus('PINs do not match');
            return;
        }
        if (user) {
            localStorage.setItem(`lynix_pin_${user.id}`, pin);
            setStatus('PIN saved successfully!');
            setPin('');
            setConfirmPin('');
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all local data? This will sign you out.")) {
            localStorage.clear();
            logout();
            navigate('signin');
        }
    };

    if (view === 'about') {
        return (
            <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
                <header className="p-4 flex items-center space-x-4 border-b border-white/10">
                    <button onClick={() => setView('main')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                    <h1 className="text-xl font-medium">About System</h1>
                </header>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-1">
                        <h2 className="text-sm text-gray-400">System Name</h2>
                        <p className="text-lg font-medium">LynixOS Desktop Environment</p>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-sm text-gray-400">User Account</h2>
                        <p className="text-lg font-medium">{user?.username}</p>
                    </div>
                    <div className="w-full h-px bg-white/10 my-4"></div>
                    <div className="space-y-1">
                        <h2 className="text-sm text-gray-400">Core Version</h2>
                        <p className="text-lg font-medium">13.0 VanillaIce</p>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'wallpaper') {
        return (
            <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
                <header className="p-4 flex items-center space-x-4 border-b border-white/10">
                    <button onClick={() => setView('main')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                    <h1 className="text-xl font-medium">Wallpaper & Style</h1>
                </header>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                    {Object.entries(wallpapers).map(([key, val]) => (
                        <button 
                            key={key} 
                            onClick={() => setWallpaper(key)} 
                            className={`rounded-2xl overflow-hidden border-2 transition-all aspect-video ${wallpaper === key ? 'border-blue-500 scale-95' : 'border-transparent'}`}
                        >
                            <div className={`w-full h-full ${val.class}`}></div>
                            <span className="block text-center py-2 text-sm bg-[#1e1e1e]">{val.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'security') {
        return (
            <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
                <header className="p-4 flex items-center space-x-4 border-b border-white/10">
                    <button onClick={() => setView('main')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                    <h1 className="text-xl font-medium">Security</h1>
                </header>
                <div className="p-6 space-y-6 max-w-md mx-auto">
                    <div>
                        <h2 className="text-lg font-medium mb-4 text-[#a8c7fa]">Session Lock</h2>
                        <p className="text-sm text-gray-400 mb-4">Set a 4-digit PIN to secure your session on this device.</p>
                        
                        <div className="space-y-4">
                            <input 
                                type="password" 
                                maxLength={4} 
                                placeholder="Enter 4-digit PIN" 
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg p-4 text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
                            />
                            <input 
                                type="password" 
                                maxLength={4} 
                                placeholder="Confirm PIN" 
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg p-4 text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={handleSetPin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                                Set PIN
                            </button>
                            {status && <p className="text-center text-sm text-green-400">{status}</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
            <header className="p-6 pb-2">
                <h1 className="text-3xl font-normal">Settings</h1>
            </header>
            
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                <div className="bg-[#1e1e1e] rounded-3xl p-4 flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                    <div className="flex-grow">
                        <h2 className="font-medium text-lg">{user?.username}</h2>
                        <p className="text-sm text-gray-400">Lynix Account</p>
                    </div>
                </div>

                <button onClick={() => setView('wallpaper')} className="w-full bg-[#1e1e1e] p-4 rounded-2xl flex items-center space-x-4 hover:bg-[#2c2c2c]">
                    <div className="p-2 bg-orange-500/20 text-orange-400 rounded-full"><PaintIcon /></div>
                    <div className="text-left flex-grow">
                        <div className="font-medium">Wallpaper & style</div>
                        <div className="text-xs text-gray-400">Colors, themes, icons</div>
                    </div>
                </button>

                <button onClick={() => setView('security')} className="w-full bg-[#1e1e1e] p-4 rounded-2xl flex items-center space-x-4 hover:bg-[#2c2c2c]">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-full"><LockIcon /></div>
                    <div className="text-left flex-grow">
                        <div className="font-medium">Security & Privacy</div>
                        <div className="text-xs text-gray-400">Screen lock, PIN</div>
                    </div>
                </button>

                <button onClick={handleReset} className="w-full bg-[#1e1e1e] p-4 rounded-2xl flex items-center space-x-4 hover:bg-[#2c2c2c]">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-full"><TrashIcon /></div>
                    <div className="text-left flex-grow">
                        <div className="font-medium">Reset Options</div>
                        <div className="text-xs text-gray-400">Erase all data, cookies</div>
                    </div>
                </button>

                <button onClick={() => setView('about')} className="w-full bg-[#1e1e1e] p-4 rounded-2xl flex items-center space-x-4 hover:bg-[#2c2c2c]">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full"><InfoIcon /></div>
                    <div className="text-left flex-grow">
                        <div className="font-medium">About System</div>
                        <div className="text-xs text-gray-400">{user?.role}</div>
                    </div>
                </button>
                
                <div className="pt-8">
                    <button onClick={() => logout()} className="w-full border border-gray-700 text-gray-300 py-3 rounded-full font-medium hover:bg-white/5">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;