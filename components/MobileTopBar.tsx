
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import { useLanguage } from '../hooks/useLanguage';

const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserSwitchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const EthernetIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" opacity="0.5"/></svg>;
const SignalIcon = ({ strength }: { strength: number }) => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20V2L2 22zm18-2h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V7h3v3z" fillOpacity={strength >= 4 ? 1 : 0.3} /><path d="M15 20h-3v-8h3v8zm-5 0H7v-5h3v5zm-5 0H2v-2h3v2z" fillOpacity={strength >= 2 ? 1 : 0.3} /><path d="M2 22L22 2" fill="none" stroke="none" /><rect x="2" y="18" width="3" height="4" fillOpacity={strength >= 1 ? 1 : 0.3} /><rect x="7" y="14" width="3" height="8" fillOpacity={strength >= 2 ? 1 : 0.3} /><rect x="12" y="10" width="3" height="12" fillOpacity={strength >= 3 ? 1 : 0.3} /><rect x="17" y="6" width="3" height="16" fillOpacity={strength >= 4 ? 1 : 0.3} /></svg>);
const WifiIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" /></svg>;

interface MobileTopBarProps {
    navigate: (page: Page) => void;
    onSleep: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ navigate, onSleep }) => {
    const { user, logout } = useAuth();
    const { language, t } = useLanguage();
    const [time, setTime] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    
    const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
    const [networkType, setNetworkType] = useState<string>('wifi');
    const [cellularGen, setCellularGen] = useState<string>('');
    const [signalStrength, setSignalStrength] = useState<number>(4);
    const [customFont, setCustomFont] = useState('');

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
            // Re-read mods every second to update UI without page reload
            if (user?.system_version === '14.0') {
                const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
                if (mods.customBattery) setBattery({ level: parseInt(mods.customBattery), charging: false });
                if (mods.customWifi) setNetworkType(mods.customWifi);
                if (mods.customCell) setCellularGen(mods.customCell);
                if (mods.signalStrength !== undefined) setSignalStrength(mods.signalStrength);
                if (mods.customFont) setCustomFont(mods.customFont);
            }
        }, 1000);
        return () => clearInterval(timerId);
    }, [user?.system_version]);

    useEffect(() => {
        // Only use real battery/network if NOT modded (user version check implicitly handled by periodic update above overriding this init)
        const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
        const isModded = user?.system_version === '14.0';
        
        if (!isModded || !mods.customBattery) {
            if ((navigator as any).getBattery) {
                (navigator as any).getBattery().then((bat: any) => {
                    const updateBat = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
                    updateBat();
                    bat.addEventListener('levelchange', updateBat);
                    bat.addEventListener('chargingchange', updateBat);
                });
            } else {
                setBattery({ level: 100, charging: false });
            }
        }

        if (!isModded) {
            setNetworkType('wifi');
            setSignalStrength(4);
        }
    }, [user?.system_version]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const timeString = time.toLocaleTimeString(language === 'en' ? 'en-US' : (language === 'fr' ? 'fr-FR' : 'es-ES'), { hour: 'numeric', minute: '2-digit' });
    
    const handleSignOut = () => {
        setIsOpen(false);
        logout();
        navigate('signin');
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientY;
        if (touchEnd - touchStart > 50) {
            setIsOpen(true);
        }
        setTouchStart(null);
    };

    const QuickTile: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-2xl w-full aspect-square transition-all ${active ? 'bg-[#a8c7fa] text-[#041e49]' : 'bg-[#303030] text-white'}`}>
            <div className="mb-2">{icon}</div>
            <span className="text-xs font-medium text-center leading-tight">{label}</span>
        </button>
    );

    const sysVersion = user?.system_version || '12.0.2';
    const isLegacy = sysVersion.startsWith('10');

    // Legacy Style Top Bar (Version 10)
    if (isLegacy) {
        return (
            <div className="fixed top-0 left-0 right-0 h-6 bg-black text-white flex justify-between items-center px-2 text-xs font-bold z-50 select-none">
                <span>{timeString}</span>
                <div className="flex space-x-2">
                    <SignalIcon strength={4} />
                    <WifiIcon />
                    <span>100%</span>
                </div>
            </div>
        );
    }

    // Determine which network icons to show
    const showEthernet = networkType === 'ethernet';
    const showWifi = networkType === 'wifi' || networkType === 'unknown'; // default fallback
    const showCellular = networkType === 'cellular';
    const showOffline = networkType === 'offline';

    // Modern Style Top Bar
    return (
        <>
            <header 
                onClick={() => setIsOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full bg-gradient-to-b from-black/80 to-transparent text-white p-2 flex justify-between items-center flex-shrink-0 z-50 cursor-pointer fixed top-0 left-0 right-0 h-8 px-4 touch-none"
                style={{ fontFamily: customFont }}
            >
                <span className="text-xs font-medium drop-shadow-md">{timeString}</span>
                <div className="flex items-center space-x-2 drop-shadow-md text-xs font-medium">
                    
                    {showEthernet && <EthernetIcon />}
                    
                    {showWifi && <WifiIcon />}
                    
                    {showCellular && (
                        <div className="flex items-center space-x-1">
                            <span>{cellularGen}</span>
                            <SignalIcon strength={signalStrength} />
                        </div>
                    )}

                    {showOffline && <span className="text-gray-400 text-[10px]">Offline</span>}

                    {/* Battery Icon */}
                    <div className="flex items-center space-x-1">
                        <span>{battery ? `${battery.level}%` : ''}</span>
                        <div className="relative w-5 h-3 border border-white rounded-sm flex items-center p-0.5">
                            <div 
                                className={`h-full bg-white ${battery && battery.level <= 20 ? 'bg-red-500' : 'bg-white'}`} 
                                style={{ width: `${battery ? battery.level : 100}%` }}
                            ></div>
                            {battery?.charging && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-black font-bold">⚡</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex flex-col animate-fade-in" style={{ fontFamily: customFont }}>
                    <div ref={panelRef} className="bg-[#1e1e1e] text-white p-6 rounded-b-3xl shadow-2xl border-b border-white/10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-normal">{timeString}</h2>
                                <p className="text-sm text-gray-400">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={() => { setIsOpen(false); navigate('app-settings'); }} className="p-2 rounded-full bg-[#303030]">
                                <SettingsIcon />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <QuickTile icon={<PowerIcon />} label={t('signOut')} onClick={handleSignOut} />
                            <QuickTile icon={<MoonIcon />} label="Sleep" onClick={() => { setIsOpen(false); onSleep(); }} active />
                            <QuickTile icon={<UserSwitchIcon />} label="Switch" onClick={handleSignOut} />
                            <QuickTile icon={<HelpIcon />} label={t('help')} onClick={() => { setIsOpen(false); navigate('app-help'); }} />
                        </div>

                        <div className="bg-[#303030] rounded-2xl p-4 mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="font-medium">{user?.username}</div>
                                    <div className="text-xs text-gray-400">Lynix ID: {user?.id}</div>
                                </div>
                            </div>
                            <button onClick={() => { setIsOpen(false); navigate('profile'); }} className="text-xs bg-black/20 px-3 py-1 rounded-full">{t('manageSession')}</button>
                        </div>
                        
                        <button onClick={() => setIsOpen(false)} className="w-full mt-6 py-2 text-center text-gray-400 text-sm">
                            {t('closePanel')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileTopBar;
