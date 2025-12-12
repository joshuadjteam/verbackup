
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Page } from '../../types';
import BrowserLoader from '../../components/BrowserLoader';
import { database } from '../../services/database';

// --- Icons ---
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const RefreshCw = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const Home = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const MoreVertical = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const SearchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CookieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
const StarIcon = (props: { filled?: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${props.filled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-500'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

interface BrowserTab {
    id: number;
    title: string;
    url: string;
    displayUrl: string; 
    history: string[];
    historyIndex: number;
    isLoading: boolean;
    isBlocked: boolean;
    blobUrl?: string; 
    navigationId: number; // Added to force loader remount
}

interface SearchResult {
    id: { videoId: string };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: { high: { url: string } };
    }
}

interface VideoDetails {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: { high: { url: string } };
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
}

interface ChannelDetails {
    id: string;
    snippet: {
        title: string;
        customUrl: string;
        thumbnails: { default: { url: string } };
    };
    statistics: {
        subscriberCount: string;
    };
}

interface CommentThread {
    id: string;
    snippet: {
        topLevelComment: {
            snippet: {
                authorDisplayName: string;
                authorProfileImageUrl: string;
                textDisplay: string;
                likeCount: number;
                publishedAt: string;
            }
        }
    }
}

interface MobiLynixBrowserAppProps {
    navigate: (page: Page, params?: any) => void;
    initialUrl?: string;
}

const SPECIAL_REDIRECT_URL = 'https://lynixity.x10.bz/iframe.html';
const YOUTUBE_SEARCH_URL = 'internal://youtube-search';
const YOUTUBE_WATCH_URL_PREFIX = 'internal://youtube-watch';
const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyBHN9YqjsgbgAikzvi_PTghK4VxBf7hmvM';

const MobiLynixBrowserApp: React.FC<MobiLynixBrowserAppProps> = ({ navigate, initialUrl }) => {
    const { user } = useAuth();
    const [tabs, setTabs] = useState<BrowserTab[]>([{ id: 1, title: 'New Tab', url: initialUrl || '', displayUrl: initialUrl || '', history: [initialUrl || ''], historyIndex: 0, isBlocked: false, isLoading: !!initialUrl, navigationId: 0 }]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [inputUrl, setInputUrl] = useState(initialUrl || '');
    const [showTabs, setShowTabs] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [securityBypassEnabled, setSecurityBypassEnabled] = useState(true);
    const [isNetworkActive, setIsNetworkActive] = useState(false);
    const [youtubeApiKey, setYoutubeApiKey] = useState(DEFAULT_YOUTUBE_API_KEY);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [cloudHistory, setCloudHistory] = useState<string[]>([]);
    const [bookmarks, setBookmarks] = useState<{title: string, url: string}[]>([]);
    const [view, setView] = useState<'browser' | 'history' | 'bookmarks' | 'cookies'>('browser');

    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId)!, [tabs, activeTabId]);
    const settingsRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const spoofedDevice = "Unknown Linux Device";
    const spoofedOS = "DozianOS for Lynix v15.0 (Mobile)";
    const spoofedClientID = "Firefox/115.0";
    const spoofedMachineName = `LynixWeb-Machine-${user?.id || 'Guest'}`;

    useEffect(() => {
        setInputUrl(activeTab.displayUrl || activeTab.url);
    }, [activeTabId, activeTab.url, activeTab.displayUrl]);

    useEffect(() => {
        if (user) {
            database.getBrowserData(user.id).then(data => {
                if (data.history) setCloudHistory(data.history);
                if (data.bookmarks) setBookmarks(data.bookmarks);
                if ((data as any).youtubeApiKey) setYoutubeApiKey((data as any).youtubeApiKey);
            });
        }
    }, [user]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (!event.data) return;

            if (event.data.type === 'LYNIX_NAVIGATE' && event.data.url) {
                handleNavigate(undefined, event.data.url);
            }

            if (event.data.type === 'PROXY_REQUEST') {
                const { id, payload } = event.data;
                const { url, method, headers, body } = payload;
                
                setIsNetworkActive(true);

                try {
                    const result = await database.fetchProxyContent(url, { method, headers, body });
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.postMessage({
                            type: 'PROXY_RESPONSE',
                            id: id,
                            response: result
                        }, '*');
                    }
                } catch (e) {
                    console.error("Proxy Request Failed:", e);
                } finally {
                    setTimeout(() => setIsNetworkActive(false), 500);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [activeTabId]);

    const updateTab = (id: number, updates: Partial<BrowserTab>) => {
        setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const addToHistory = (url: string) => {
        if (!url || url === SPECIAL_REDIRECT_URL || url.startsWith('internal') || url === YOUTUBE_SEARCH_URL) return;
        const newHistory = [url, ...cloudHistory].slice(0, 50);
        setCloudHistory(newHistory);
        if (user) database.saveBrowserData(user.id, { history: newHistory });
    };

    const saveYoutubeKey = (key: string) => {
        setYoutubeApiKey(key);
        if (user) {
            database.getBrowserData(user.id).then(data => {
                database.saveBrowserData(user.id, { ...data, youtubeApiKey: key } as any);
            });
        }
    };

    const toggleBookmark = () => {
        if (!activeTab.displayUrl) return;
        const isBookmarked = bookmarks.some(b => b.url === activeTab.displayUrl);
        let newBookmarks;
        if (isBookmarked) {
            newBookmarks = bookmarks.filter(b => b.url !== activeTab.displayUrl);
        } else {
            newBookmarks = [...bookmarks, { title: activeTab.title || activeTab.displayUrl, url: activeTab.displayUrl }];
        }
        setBookmarks(newBookmarks);
        if (user) database.saveBrowserData(user.id, { bookmarks: newBookmarks });
    };

    const handleNavigate = (e?: React.FormEvent, overrideUrl?: string) => {
        if (e) e.preventDefault();
        let finalUrl = overrideUrl ? overrideUrl.trim() : inputUrl.trim();
        if (!finalUrl) return;

        if (finalUrl.startsWith('https://internal.local/')) {
            finalUrl = finalUrl.replace('https://internal.local/', 'internal://');
        }

        const lowerUrl = finalUrl.toLowerCase();
        let actualUrl = finalUrl;
        let displayUrl = finalUrl;

        if (!lowerUrl.startsWith('http') && !lowerUrl.startsWith('internal://')) {
             const isSearch = !lowerUrl.includes('.') || lowerUrl.includes(' ');
             if (isSearch) {
                 actualUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
                 displayUrl = actualUrl;
             } else {
                 actualUrl = `https://${finalUrl}`;
                 displayUrl = actualUrl;
             }
        } else {
            actualUrl = finalUrl;
        }

        const youtubeWatchRegex = /(?:www\.)?youtube\.[a-z.]+\/watch/;
        const youtubeShortRegex = /youtu\.be\//;
        const youtubeGeneralRegex = /(?:www\.)?youtube\.[a-z.]+/;

        if (youtubeWatchRegex.test(actualUrl) || youtubeShortRegex.test(actualUrl)) {
            try {
                let videoId = '';
                const urlObj = new URL(actualUrl.startsWith('http') ? actualUrl : `https://${actualUrl}`);
                if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1);
                } else {
                    videoId = urlObj.searchParams.get('v') || '';
                }
                if (videoId) {
                    actualUrl = `${YOUTUBE_WATCH_URL_PREFIX}?v=${videoId}`;
                }
            } catch (e) { }
        } else if (youtubeGeneralRegex.test(actualUrl)) {
             actualUrl = YOUTUBE_SEARCH_URL;
        }

        if (actualUrl.startsWith('internal://')) {
            if (actualUrl === YOUTUBE_SEARCH_URL) {
                displayUrl = 'YouTube Search';
            } else if (actualUrl.startsWith(YOUTUBE_WATCH_URL_PREFIX)) {
                displayUrl = 'YouTube Player';
            } else {
                const appName = actualUrl.replace('internal://', '');
                displayUrl = `https://internal.local/${appName}`;
            }
        } else {
            displayUrl = actualUrl;
        }

        addToHistory(displayUrl);

        setTabs(currentTabs => {
            const tab = currentTabs.find(t => t.id === activeTabId);
            if(!tab) return currentTabs;

            const newHistory = tab.history.slice(0, tab.historyIndex + 1);
            newHistory.push(displayUrl);
            
            if (tab.blobUrl) URL.revokeObjectURL(tab.blobUrl);

            return currentTabs.map(t => t.id === activeTabId ? { 
                ...t,
                url: actualUrl, 
                displayUrl: displayUrl, 
                title: displayUrl === 'YouTube Player' ? 'YouTube Player' : (displayUrl === 'YouTube Search' ? 'YouTube Search' : displayUrl),
                history: newHistory, 
                historyIndex: newHistory.length - 1, 
                isBlocked: false,
                isLoading: true,
                blobUrl: undefined,
                navigationId: t.navigationId + 1 
            } : t);
        });
    };

    const handleLoaderComplete = (blobUrl?: string) => {
        updateTab(activeTabId, { isLoading: false, blobUrl });
    };

    const handleBack = () => { if(activeTab.historyIndex > 0) { const newIdx = activeTab.historyIndex - 1; const u = activeTab.history[newIdx]; updateTab(activeTabId, { url: u, displayUrl: u, historyIndex: newIdx, isLoading: true, blobUrl: undefined, navigationId: activeTab.navigationId + 1 }); setInputUrl(u); }};
    const handleForward = () => { if(activeTab.historyIndex < activeTab.history.length - 1) { const newIdx = activeTab.historyIndex + 1; const u = activeTab.history[newIdx]; updateTab(activeTabId, { url: u, displayUrl: u, historyIndex: newIdx, isLoading: true, blobUrl: undefined, navigationId: activeTab.navigationId + 1 }); setInputUrl(u); }};
    const handleRefresh = () => updateTab(activeTabId, { isLoading: true, blobUrl: undefined, navigationId: activeTab.navigationId + 1 });
    const addNewTab = () => { const id = Date.now(); setTabs([...tabs, { id, title: 'New Tab', url: '', displayUrl: '', history: [''], historyIndex: 0, isLoading: false, isBlocked: false, navigationId: 0 }]); setActiveTabId(id); setInputUrl(''); setShowTabs(false); setView('browser'); };
    const closeTab = (e: any, id: number) => { e.stopPropagation(); const t = tabs.find(x => x.id === id); if(t?.blobUrl) URL.revokeObjectURL(t.blobUrl); if(tabs.length === 1) { updateTab(id, { url: '', displayUrl: '', title: 'New Tab', history: [''], historyIndex: 0, isLoading: false, blobUrl: undefined, navigationId: 0 }); setInputUrl(''); return; } const nt = tabs.filter(x => x.id !== id); setTabs(nt); if(id === activeTabId) { setActiveTabId(nt[nt.length - 1].id); setInputUrl(nt[nt.length - 1].displayUrl); }};
    const switchToTab = (id: number) => { setActiveTabId(id); const t = tabs.find(x => x.id === id); if(t) setInputUrl(t.displayUrl); setShowTabs(false); setView('browser'); };
    const clearCookies = () => { if(window.confirm("Clear all session data?")) { tabs.forEach(t => { if(t.blobUrl) URL.revokeObjectURL(t.blobUrl); }); setTabs([{ id: Date.now(), title: 'New Tab', url: '', displayUrl: '', history: [''], historyIndex: 0, isLoading: false, isBlocked: false, navigationId: 0 }]); setView('browser'); alert("Cleared."); }};
    const clearHistory = () => { if(window.confirm("Delete history?")) { setCloudHistory([]); if(user) database.saveBrowserData(user.id, { history: [] }); }};

    const isExternal = activeTab.url && !activeTab.url.startsWith('internal://') && activeTab.url !== SPECIAL_REDIRECT_URL;
    const shouldUseLoader = activeTab.isLoading && isExternal && securityBypassEnabled;
    
    const iframeSrc = (securityBypassEnabled && isExternal)
        ? (activeTab.blobUrl || 'about:blank')
        : activeTab.url;

    return (
        <div className="w-full h-full flex flex-col bg-[#dfe3e7] dark:bg-[#202124] text-black dark:text-white rounded-lg overflow-hidden font-sans select-none relative">
             {/* Disclaimer Overlay */}
            <div className="absolute bottom-8 right-4 bg-black/80 text-white text-[10px] p-3 rounded-lg max-w-[200px] backdrop-blur-md z-30 pointer-events-auto shadow-lg border border-white/10">
               Popular and High Demand websites may block this browser due to security circumstances!
               <button onClick={() => navigate('support')} className="underline text-blue-300 ml-1 font-bold hover:text-blue-200">Visit FaQ</button>
               to know what websites are blocked!
            </div>

             {showTabs && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col p-4">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-white text-lg font-bold">Tabs</h2><button onClick={() => setShowTabs(false)} className="text-white p-2">Done</button></div>
                    <div className="flex-grow grid grid-cols-2 gap-4 overflow-y-auto">{tabs.map(tab => (<div key={tab.id} onClick={() => switchToTab(tab.id)} className={`relative p-4 rounded-lg border ${activeTabId === tab.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800'} flex flex-col justify-between h-32`}><div className="text-white text-sm font-bold truncate">{tab.title}</div><div className="text-gray-400 text-xs truncate">{tab.displayUrl || 'Empty'}</div><button onClick={(e) => closeTab(e, tab.id)} className="absolute top-2 right-2 bg-gray-700 rounded-full p-1 text-white"><XIcon/></button></div>))}</div>
                    <button onClick={addNewTab} className="mt-4 w-full py-3 bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center space-x-2"><Plus /> <span>New Tab</span></button>
                </div>
            )}

            <div className="flex-shrink-0 bg-gray-100 dark:bg-[#2c2c2c] p-2 border-b border-gray-300 dark:border-black flex items-center space-x-2 shadow-sm z-20">
                <div className="relative" ref={accountRef}><button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"><UserIcon /></button>{accountMenuOpen && (<div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#35363a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50"><button onClick={() => { setView('history'); setAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><GlobeIcon /><span>Cloud History</span></button><button onClick={() => { setView('bookmarks'); setAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><StarIcon /><span>Bookmarks</span></button></div>)}</div>
                <form onSubmit={handleNavigate} className="flex-grow relative"><div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">{isNetworkActive ? <ActivityIcon /> : (activeTab.url && activeTab.url.startsWith('https') ? <LockIcon /> : <SearchIcon className="w-4 h-4 text-gray-400" />)}</div><input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full py-2 pl-10 pr-8 rounded-lg border-none outline-none bg-white dark:bg-[#404040] text-sm text-black dark:text-white shadow-inner" placeholder="Search or type URL" onFocus={(e) => e.target.select()} onKeyDown={(e) => e.key === 'Enter' && handleNavigate(undefined, (e.target as HTMLInputElement).value)} />{inputUrl && (<button type="button" onClick={() => { setInputUrl(''); }} className="absolute inset-y-0 right-2 flex items-center text-gray-500"><XIcon /></button>)}</form>
                <button onClick={() => setShowTabs(true)} className="w-8 h-8 rounded-lg border-2 border-gray-600 dark:border-gray-400 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10">{tabs.length}</button>
                <div className="relative" ref={settingsRef}><button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"><MoreVertical /></button>{settingsMenuOpen && (<div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#35363a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50"><div className="px-4 py-2 flex items-center justify-between"><span className="text-sm font-medium">Security Bypass</span><button onClick={() => setSecurityBypassEnabled(!securityBypassEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${securityBypassEnabled ? 'bg-green-500' : 'bg-gray-400'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${securityBypassEnabled ? 'left-6' : 'left-1'}`}></div></button></div><div className="px-4 py-2"><label className="text-xs text-gray-500 block mb-1">YouTube API Key</label><input type="password" value={youtubeApiKey} onChange={(e) => saveYoutubeKey(e.target.value)} placeholder="Paste key..." className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs"/></div><div className="border-t border-gray-200 dark:border-gray-600 my-1"></div><button onClick={clearCookies} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><CookieIcon /><span>Clear Cookies</span></button><button onClick={() => { setView('history'); setSettingsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><HistoryIcon /><span>History</span></button></div>)}</div>
            </div>
            
            <div className="flex-grow relative bg-white dark:bg-[#202124] w-full h-full overflow-hidden">
                {view === 'browser' ? (
                    <>
                        {activeTab.url === YOUTUBE_SEARCH_URL ? (
                            <YouTubeSearchView apiKey={youtubeApiKey} onNavigate={(url) => handleNavigate(undefined, url)} />
                        ) : activeTab.url.startsWith(YOUTUBE_WATCH_URL_PREFIX) ? (
                            <MobiYouTubeWatchView apiKey={youtubeApiKey} videoId={new URL(activeTab.url.replace('internal://', 'https://')).searchParams.get('v') || ''} onNavigate={(url) => handleNavigate(undefined, url)} />
                        ) : (
                            <>
                                {shouldUseLoader && <BrowserLoader key={`${activeTabId}-${activeTab.url}-${activeTab.navigationId}`} url={activeTab.displayUrl} isMobile={true} onComplete={handleLoaderComplete} />}
                                {activeTab.url && iframeSrc && iframeSrc !== 'about:blank' ? (
                                    <iframe 
                                        ref={iframeRef} 
                                        key={iframeSrc} 
                                        src={iframeSrc} 
                                        className="w-full h-full border-0" 
                                        referrerPolicy="no-referrer" 
                                        title="browser-content" 
                                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation allow-downloads allow-modals"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; geolocation; payment" 
                                        onLoad={() => updateTab(activeTabId, { isLoading: false })} 
                                    />
                                ) : (
                                     !shouldUseLoader && <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                                         <h1 className="text-6xl font-bold text-[#5f6368] dark:text-[#e8eaed] mb-8 select-none">Bing</h1>
                                        <div className="w-full max-w-lg px-4">
                                            <div className="relative group shadow-lg rounded-full">
                                                <input type="text" placeholder="Search Bing or type a URL" className="w-full pl-12 pr-5 py-3 rounded-full border border-gray-200 dark:border-gray-500 bg-white dark:bg-[#202124] focus:outline-none dark:text-white transition-shadow shadow-sm" onKeyDown={(e) => e.key === 'Enter' && handleNavigate(undefined, (e.target as HTMLInputElement).value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="p-8 overflow-y-auto h-full">
                        {view === 'history' && (<div><h2 className="text-2xl font-bold mb-4">History</h2><button onClick={clearHistory} className="mb-4 px-3 py-2 bg-red-600 text-white rounded text-sm">Clear History</button><ul className="space-y-2">{cloudHistory.map((h, i) => <li key={i} className="truncate border-b py-2 cursor-pointer hover:text-blue-500" onClick={() => { handleNavigate(undefined, h); setView('browser'); }}>{h}</li>)}</ul></div>)}
                        {view === 'bookmarks' && (<div><h2 className="text-2xl font-bold mb-4">Bookmarks</h2><ul className="space-y-2">{bookmarks.map((b, i) => <li key={i} className="truncate border-b py-2 cursor-pointer hover:text-blue-500" onClick={() => { handleNavigate(undefined, b.url); setView('browser'); }}>{b.title}</li>)}</ul></div>)}
                        {view === 'cookies' && (<div className="text-center"><h2 className="text-2xl font-bold mb-4">Cookie Manager</h2><button onClick={clearCookies} className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold">Clear All Session Data</button></div>)}
                    </div>
                )}
            </div>

            <div className="h-6 bg-[#f1f3f4] dark:bg-[#292a2d] border-t border-gray-300 dark:border-black/50 flex items-center justify-between px-3 text-[10px] text-gray-500 font-mono select-none cursor-default">
                <div className="flex space-x-4"><span>{spoofedOS}</span></div>
                <div className="flex space-x-4"><span>{spoofedClientID}</span><span>{spoofedMachineName}</span></div>
            </div>
        </div>
    );
};

const YouTubeSearchView: React.FC<{ apiKey: string; onNavigate: (url: string) => void }> = ({ apiKey, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!apiKey) { setError("API Key Missing"); return; }
        if (!query) return;
        setLoading(true); setError('');
        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            setResults(data.items || []);
        } catch (e: any) { setError(e.message || 'Search failed'); } finally { setLoading(false); }
    };

    if (!apiKey) return <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4"><YoutubeIcon /><h2 className="text-2xl font-bold">API Key Required</h2></div>;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#0f0f0f] overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-4">
                <YoutubeIcon />
                <input type="text" className="flex-grow bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-black dark:text-white text-sm" placeholder="Search YouTube..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
                <button onClick={handleSearch} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-full">{loading ? '...' : 'Search'}</button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                {error && <div className="text-red-500 text-center p-4">{error}</div>}
                <div className="grid grid-cols-1 gap-4">
                    {results.map(item => (
                        <div key={item.id.videoId} className="cursor-pointer group" onClick={() => onNavigate(`https://youtube.com/watch?v=${item.id.videoId}`)}>
                            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-2"><img src={item.snippet.thumbnails.high.url} className="w-full h-full object-cover" /></div>
                            <h3 className="font-bold text-sm text-black dark:text-white line-clamp-2">{item.snippet.title}</h3>
                            <p className="text-xs text-gray-500">{item.snippet.channelTitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MobiYouTubeWatchView: React.FC<{ videoId: string; apiKey: string; onNavigate: (url: string) => void }> = ({ videoId, apiKey, onNavigate }) => {
    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [channel, setChannel] = useState<ChannelDetails | null>(null);
    const [comments, setComments] = useState<CommentThread[]>([]);
    const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!videoId || !apiKey) return;
        const fetchData = async () => {
            setLoading(true); setError('');
            try {
                const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`);
                const vidData = await vidRes.json();
                if (!vidData.items?.length) throw new Error("Video not found");
                const videoDetails = vidData.items[0];
                setVideo(videoDetails);

                const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoDetails.snippet.channelId}&key=${apiKey}`);
                const channelData = await channelRes.json();
                if (channelData.items?.length) setChannel(channelData.items[0]);

                const commentsRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&key=${apiKey}`);
                const commentsData = await commentsRes.json();
                if (commentsData.items) setComments(commentsData.items);

                const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoDetails.snippet.title)}&type=video&maxResults=5&key=${apiKey}`);
                const searchData = await searchRes.json();
                if (searchData.items) setRecommendations(searchData.items.filter((item: any) => item.id.videoId !== videoId));

            } catch (e: any) { console.error(e); setError(e.message); } finally { setLoading(false); }
        };
        fetchData();
    }, [videoId, apiKey]);

    const formatNumber = (numStr: string) => {
        const num = parseInt(numStr);
        if (isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) return <div className="flex items-center justify-center h-full text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
    if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    if (!video) return null;

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] text-white font-sans overflow-y-auto custom-scrollbar">
            <div className="bg-[#7c3aed] p-3 text-center shadow-lg flex-shrink-0"><h1 className="text-xl font-bold mb-0 text-white">Parsoley</h1><p className="text-[10px] text-purple-200">Lynix Player</p></div>
            <div className="aspect-video w-full bg-black shadow-2xl relative group flex-shrink-0">
                <iframe src={embedUrl} title={video.snippet.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe>
            </div>
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <div className="bg-white text-black p-3 rounded-xl flex justify-between items-center shadow-lg border-l-4 border-green-500"><div><div className="text-xl font-bold">{formatNumber(video.statistics.likeCount)}</div><div className="text-xs font-semibold text-gray-600">Likes</div></div><div className="text-xs text-gray-400">Dislikes: N/A</div></div>
                    <div className="bg-white text-black p-3 rounded-xl flex items-center space-x-3 shadow-lg border-t-4 border-blue-500">{channel && <img src={channel.snippet.thumbnails.default.url} className="w-10 h-10 rounded-full" alt="avatar" />}<div><div className="font-bold text-sm">@{channel?.snippet.customUrl || video.snippet.channelTitle}</div><div className="text-xs text-gray-600">{video.snippet.channelTitle}</div></div></div>
                    <div className="bg-white text-black p-3 rounded-xl flex justify-between items-center shadow-lg border-r-4 border-purple-500"><div className="text-sm font-bold">Comments: {formatNumber(video.statistics.commentCount)}</div><div className="text-sm font-bold">Views: {formatNumber(video.statistics.viewCount)}</div></div>
                </div>
                <div className="bg-[#7c3aed] text-white p-4 rounded-xl shadow-lg"><div className="font-bold mb-1 text-sm">Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}</div><div className="text-xs whitespace-pre-wrap leading-relaxed line-clamp-4"><span className="font-bold">Desc:</span> {video.snippet.description}</div></div>
                <div className="bg-[#272727] p-4 rounded-xl shadow-lg"><h3 className="text-sm font-bold mb-3">--- Comments ---</h3>{comments.length > 0 ? (<div className="space-y-3">{comments.slice(0, 5).map(comment => (<div key={comment.id} className="text-xs"><span className="font-bold text-gray-300 block">@{comment.snippet.topLevelComment.snippet.authorDisplayName}</span><span className="text-gray-400" dangerouslySetInnerHTML={{__html: comment.snippet.topLevelComment.snippet.textDisplay}}></span></div>))}</div>) : (<p className="text-gray-500 text-xs">No comments.</p>)}</div>
                <div><h3 className="text-sm font-bold text-gray-400 mb-3 px-1">Recommended</h3><div className="space-y-3">{recommendations.map(rec => (<div key={rec.id.videoId} className="flex space-x-3 cursor-pointer" onClick={() => onNavigate(`https://youtube.com/watch?v=${rec.id.videoId}`)}><div className="w-32 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0"><img src={rec.snippet.thumbnails.high.url} className="w-full h-full object-cover" alt="" /></div><p className="text-xs font-semibold text-white line-clamp-3">{rec.snippet.title}</p></div>))}</div></div>
            </div>
        </div>
    );
};

export default MobiLynixBrowserApp;
