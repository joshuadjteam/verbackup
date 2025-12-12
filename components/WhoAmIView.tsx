
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface WhoAmIViewProps {
    autoStartTest?: boolean;
}

const WhoAmIView: React.FC<WhoAmIViewProps> = ({ autoStartTest }) => {
    const { user } = useAuth();
    const [ipInfo, setIpInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [speed, setSpeed] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Using ipwho.is for IP geolocation (no API key required for client-side usage)
        fetch('https://ipwho.is/')
            .then(res => res.json())
            .then(data => {
                setIpInfo(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const runSpeedTest = async () => {
        setTesting(true);
        try {
            const start = performance.now();
            // Fetch current page to test latency (cache bust)
            await fetch(window.location.href + '?t=' + start, { mode: 'no-cors' });
            const end = performance.now();
            const latency = Math.round(end - start);
            
            // Get connection details if available (Chrome/Edge)
            const conn = (navigator as any).connection;
            const downlink = conn ? conn.downlink : null;
            const type = conn ? conn.effectiveType : null;
            
            let speedText = `Latency: ${latency}ms`;
            if (downlink) speedText += ` | Est. Speed: ~${downlink} Mbps`;
            if (type) speedText += ` (${type})`;
            
            setSpeed(speedText);
        } catch (e) {
            setSpeed("Could not measure connection.");
        }
        setTesting(false);
    };

    useEffect(() => {
        if (autoStartTest) {
            runSpeedTest();
        }
    }, [autoStartTest]);

    const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
        else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
        else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
        else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
        else if (ua.indexOf("Edge") > -1) browser = "Microsoft Edge";
        else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
        else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";
        return browser;
    };

    const getOSInfo = () => {
        const ua = navigator.userAgent;
        let os = "Unknown OS";
        if (ua.indexOf("Win") !== -1) os = "Windows";
        if (ua.indexOf("Mac") !== -1) os = "MacOS";
        if (ua.indexOf("X11") !== -1) os = "UNIX";
        if (ua.indexOf("Linux") !== -1) os = "Linux";
        if (ua.indexOf("Android") !== -1) os = "Android";
        if (ua.indexOf("like Mac") !== -1) os = "iOS";
        return os;
    };

    return (
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
            {/* Identity Section */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">Identity</h3>
                <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                        <span className="font-medium">Client ID</span>
                        <span className="font-mono">{user ? `LNX-${user.id.toString().padStart(6, '0')}` : 'Guest-Session'}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="font-medium">Username</span>
                        <span>{user?.username || 'Guest User'}</span>
                    </div>
                </div>
            </div>

            {/* Network Section */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-500">Network Info</h3>
                <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 text-sm">
                    {loading ? <div className="text-center italic text-gray-500">Scanning Network Topology...</div> : (
                        <>
                            <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                <span className="font-medium">Public IP</span>
                                <span className="font-mono text-blue-400">{ipInfo?.ip || 'Hidden'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 py-2">
                                <span className="font-medium">ISP</span>
                                <span className="text-right max-w-[200px] truncate">{ipInfo?.connection?.isp || ipInfo?.org || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="font-medium">Location</span>
                                <span className="text-right">{ipInfo?.city}, {ipInfo?.country}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Device Section */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500">Client Details</h3>
                <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                        <span className="font-medium">OS</span>
                        <span>{getOSInfo()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 py-2">
                        <span className="font-medium">Browser</span>
                        <span>{getBrowserInfo()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 py-2">
                        <span className="font-medium">User Agent</span>
                        <span className="text-xs truncate max-w-[150px]">{navigator.userAgent}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 py-2">
                        <span className="font-medium">Language</span>
                        <span>{navigator.language}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 py-2">
                        <span className="font-medium">Cores</span>
                        <span>{navigator.hardwareConcurrency || '?'}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="font-medium">Resolution</span>
                        <span>{window.screen.width} x {window.screen.height}</span>
                    </div>
                </div>
            </div>

            {/* Diagnostics Section */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">Diagnostics</h3>
                <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center text-sm">
                    <div>
                        <div className="font-medium">Connection Check</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{speed || 'Ready to test'}</div>
                    </div>
                    <button 
                        onClick={runSpeedTest} 
                        disabled={testing}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${testing ? 'bg-gray-400 cursor-not-allowed text-gray-800' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-95'}`}
                    >
                        {testing ? (
                            <>
                                <div className="w-3 h-3 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                <span>Ping...</span>
                            </>
                        ) : (
                            'Run Speedtest'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhoAmIView;
