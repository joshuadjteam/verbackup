
import React, { useState, useEffect } from 'react';
import { Page } from '../../types';

interface MobiModderAppProps {
    navigate: (page: Page) => void;
    onReboot?: () => void; // Optional prop for soft reboot
}

const MobiModderApp: React.FC<MobiModderAppProps> = ({ navigate, onReboot }) => {
    const [customFont, setCustomFont] = useState('sans-serif');
    const [customCell, setCustomCell] = useState('5G');
    const [customWifi, setCustomWifi] = useState('wifi');
    const [signalStrength, setSignalStrength] = useState(4);
    const [customBattery, setCustomBattery] = useState('100');
    const [deviceName, setDeviceName] = useState('');
    const [deviceModel, setDeviceModel] = useState('');
    const [launcherStyle, setLauncherStyle] = useState('pixel');

    useEffect(() => {
        const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
        if (mods.customFont) setCustomFont(mods.customFont);
        if (mods.customCell) setCustomCell(mods.customCell);
        if (mods.customWifi) setCustomWifi(mods.customWifi);
        if (mods.signalStrength !== undefined) setSignalStrength(mods.signalStrength);
        if (mods.customBattery) setCustomBattery(mods.customBattery);
        if (mods.launcherStyle) setLauncherStyle(mods.launcherStyle);
        
        setDeviceName(localStorage.getItem('lynix_device_name') || 'Generic Lynix Mobile');
        setDeviceModel(localStorage.getItem('lynix_device_model') || 'LNX-M1');
    }, []);

    const saveMods = () => {
        const mods = {
            customFont,
            customCell,
            customWifi, // 'wifi', 'ethernet', 'cellular', 'offline'
            signalStrength,
            customBattery,
            launcherStyle
        };
        localStorage.setItem('lynix_mods', JSON.stringify(mods));
        localStorage.setItem('lynix_device_name', deviceName);
        localStorage.setItem('lynix_device_model', deviceModel);
        
        // Force a reload to apply changes at the App level (launcher switching)
        if (onReboot) {
            // Soft reboot for Mobilator
            onReboot();
        } else {
            // Full reload for real mobile device
            alert('Mods Applied! Rebooting User Space...');
            window.location.reload();
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-black text-white font-mono p-6 overflow-y-auto">
            <h1 className="text-3xl font-bold mb-2 text-green-500">System Modder</h1>
            <p className="text-xs text-gray-500 mb-8">ROOT ACCESS GRANTED - VER 14.0</p>

            <div className="space-y-6 pb-20">
                <section className="border border-green-900 p-4 rounded-lg bg-green-900/10">
                    <h2 className="text-green-400 font-bold mb-4">Display & Typography</h2>
                    <div className="space-y-2">
                        <label className="block text-xs text-gray-400">System Font</label>
                        <select value={customFont} onChange={e => setCustomFont(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded text-white">
                            <option value="sans-serif">Default Sans</option>
                            <option value="serif">Serif</option>
                            <option value="monospace">Monospace</option>
                            <option value="cursive">Cursive (Comic)</option>
                            <option value="fantasy">Fantasy</option>
                        </select>
                    </div>
                </section>

                <section className="border border-green-900 p-4 rounded-lg bg-green-900/10">
                    <h2 className="text-green-400 font-bold mb-4">Status Bar Override</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Network Mode</label>
                            <select value={customWifi} onChange={e => setCustomWifi(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded">
                                <option value="wifi">WiFi Enabled</option>
                                <option value="ethernet">Ethernet (Wired)</option>
                                <option value="cellular">Cellular Data Only</option>
                                <option value="offline">Offline / Airplane</option>
                            </select>
                        </div>
                        
                        {customWifi === 'cellular' && (
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Signal Text</label>
                                    <input type="text" value={customCell} onChange={e => setCustomCell(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded" placeholder="5G, LTE..." />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Strength (0-4)</label>
                                    <input type="number" max="4" min="0" value={signalStrength} onChange={e => setSignalStrength(parseInt(e.target.value))} className="w-full bg-black border border-gray-700 p-2 rounded" />
                                </div>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Battery Level (%)</label>
                            <input type="number" max="100" min="0" value={customBattery} onChange={e => setCustomBattery(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded" />
                        </div>
                    </div>
                </section>

                <section className="border border-green-900 p-4 rounded-lg bg-green-900/10">
                    <h2 className="text-green-400 font-bold mb-4">Device Identity</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Device Name</label>
                            <input type="text" value={deviceName} onChange={e => setDeviceName(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Model Number</label>
                            <input type="text" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded" />
                        </div>
                    </div>
                </section>

                <section className="border border-green-900 p-4 rounded-lg bg-green-900/10">
                    <h2 className="text-green-400 font-bold mb-4">Launcher Environment</h2>
                    <div className="space-y-2">
                        <label className="block text-xs text-gray-400">Home Screen Skin</label>
                        <select value={launcherStyle} onChange={e => setLauncherStyle(e.target.value)} className="w-full bg-black border border-gray-700 p-2 rounded text-white">
                            <option value="pixel">Pixel Launcher (Default)</option>
                            <option value="oneui">OneUI 8 (Samsung Style)</option>
                            <option value="bb10">BlackBerry 10 Flow</option>
                        </select>
                    </div>
                </section>

                <button onClick={saveMods} className="w-full py-4 bg-green-600 hover:bg-green-700 text-black font-bold rounded-lg shadow-lg text-lg">
                    APPLY MODS & REBOOT
                </button>

                <div className="pt-8 border-t border-gray-800">
                    <button onClick={() => navigate('recovery-mode' as any)} className="w-full py-3 bg-red-900/50 hover:bg-red-800 border border-red-600 text-red-400 font-bold rounded-lg text-sm">
                        Boot to Recovery
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobiModderApp;
