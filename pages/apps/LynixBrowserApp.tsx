
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import BrowserLoader from '../../components/BrowserLoader';
import { Page } from '../../types';

// --- Icons ---
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const RefreshCw = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const Home = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const MoreVertical = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const StarIcon = (props: { filled?: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${props.filled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-500'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const CookieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;

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
    navigationId: number;
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

const SPECIAL_REDIRECT_URL = 'https://lynixity.x10.bz/iframe.html';
const YOUTUBE_SEARCH_URL = 'internal://youtube-search';
const YOUTUBE_WATCH_URL_PREFIX = 'internal://youtube-watch';
const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyBHN9YqjsgbgAikzvi_PTghK4VxBf7hmvM';

interface LynixBrowserAppProps {
    navigate: (page: Page, params?: any) => void;
}

const LynixBrowserApp: React.FC<LynixBrowserAppProps> = ({ navigate }) => {
    const { user } = useAuth();
    const [tabs, setTabs] = useState<BrowserTab[]>([
        { id: 1, title: 'New Tab', url: '', displayUrl: '', history: [''], historyIndex: 0, isLoading: false, isBlocked: false, navigationId: 0 }
    ]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [addressBarInput, setAddressBarInput] = useState('');
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [securityBypassEnabled, setSecurityBypassEnabled] = useState(true);
    const [cloudHistory, setCloudHistory] = useState<string[]>([]);
    const [bookmarks, setBookmarks] = useState<{title: string, url: string}[]>([]);
    const [youtubeApiKey, setYoutubeApiKey] = useState(DEFAULT_YOUTUBE_API_KEY);
    const [isNetworkActive, setIsNetworkActive] = useState(false);
    const [view, setView] = useState<'browser' | 'history' | 'bookmarks' | 'cookies'>('browser');

    const spoofedDevice = "Unknown Linux Device";
    const spoofedOS = "DozianOS for Lynix v15.0";
    const spoofedMachineName = `LynixWeb-Machine-${user?.id || 'Guest'}`;
    const spoofedClientID = "Firefox/115.0"; 

    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId)!, [tabs, activeTabId]);
    const settingsRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        setAddressBarInput(activeTab.displayUrl || activeTab.url);
    }, [activeTabId, activeTab.displayUrl, activeTab.url]);

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
                handleNavigate(event.data.url);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setSettingsMenuOpen(false);
            if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleNavigate = (input: string) => {
        let finalUrl = input.trim();
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
            if (!tab) return currentTabs;

            const newHistory = tab.history.slice(0, tab.historyIndex + 1);
            newHistory.push(displayUrl);

            if (tab.blobUrl) {
                URL.revokeObjectURL(tab.blobUrl);
            }

            return currentTabs.map(t => t.id === activeTabId ? {
                ...t,
                url: actualUrl,
                displayUrl: displayUrl,
                title: displayUrl === 'YouTube Player' ? 'YouTube Player' : (displayUrl === 'YouTube Search' ? 'YouTube Search' : displayUrl),
                history: newHistory,
                historyIndex: newHistory.length - 1,
                isLoading: true, 
                isBlocked: false, 
                blobUrl: undefined,
                navigationId: t.navigationId + 1 
            } : t);
        });
    };

    const handleLoaderComplete = (blobUrl?: string) => {
        updateTab(activeTabId, { isLoading: false, blobUrl: blobUrl });
    };

    const handleBack = () => {
        if (activeTab.historyIndex > 0) {
            const newIndex = activeTab.historyIndex - 1;
            const prevUrl = activeTab.history[newIndex];
            updateTab(activeTabId, {
                url: prevUrl,
                displayUrl: prevUrl,
                historyIndex: newIndex,
                isLoading: true,
                blobUrl: undefined,
                navigationId: activeTab.navigationId + 1
            });
        }
    };

    const handleForward = () => {
        if (activeTab.historyIndex < activeTab.history.length - 1) {
            const newIndex = activeTab.historyIndex + 1;
            const nextUrl = activeTab.history[newIndex];
            updateTab(activeTabId, {
                url: nextUrl,
                displayUrl: nextUrl,
                historyIndex: newIndex,
                isLoading: true,
                blobUrl: undefined,
                navigationId: activeTab.navigationId + 1
            });
        }
    };

    const handleRefresh = () => {
        updateTab(activeTabId, { isLoading: true, blobUrl: undefined, navigationId: activeTab.navigationId + 1 });
    };

    const addTab = () => {
        const newId = Date.now();
        const newTab: BrowserTab = { id: newId, title: 'New Tab', url: '', displayUrl: '', history: [''], historyIndex: 0, isLoading: false, isBlocked: false, navigationId: 0 };
        setTabs([...tabs, newTab]);
        setActiveTabId(newId);
        setView('browser');
    };

    const closeTab = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const tabToClose = tabs.find(t => t.id === id);
        if (tabToClose?.blobUrl) URL.revokeObjectURL(tabToClose.blobUrl);

        if (tabs.length === 1) {
            updateTab(id, { url: '', displayUrl: '', title: 'New Tab', history: [''], historyIndex: 0, isBlocked: false, blobUrl: undefined, navigationId: 0 });
            return;
        }
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (id === activeTabId) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const clearCookies = () => {
        if (window.confirm("Clear all session data?")) {
            tabs.forEach(t => { if (t.blobUrl) URL.revokeObjectURL(t.blobUrl); });
            setTabs([{ id: Date.now(), title: 'New Tab', url: '', displayUrl: '', history: [''], historyIndex: 0, isLoading: false, isBlocked: false, navigationId: 0 }]);
            alert("Cleared.");
            setView('browser');
        }
    };

    const clearHistory = () => {
        if (window.confirm("Delete all cloud history?")) {
            setCloudHistory([]);
            if (user) database.saveBrowserData(user.id, { history: [] });
        }
    };

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

            <div className="flex h-10 px-2 pt-2 space-x-1 overflow-x-auto no-scrollbar items-end bg-[#dee1e6] dark:bg-[#000000]">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => { setActiveTabId(tab.id); setView('browser'); }}
                        className={`group relative flex items-center min-w-[140px] max-w-[220px] h-8 px-3 text-xs rounded-t-xl cursor-pointer transition-all ${activeTabId === tab.id && view === 'browser' ? 'bg-white dark:bg-[#35363a] text-black dark:text-white shadow-sm z-10' : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10'}`}
                    >
                        <div className="flex items-center space-x-2 w-full overflow-hidden">
                            {tab.isLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 flex-shrink-0"></div> : (tab.url ? <GlobeIcon /> : <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0"></div>)}
                            <span className="truncate flex-grow font-medium">{tab.title || 'New Tab'}</span>
                            <button onClick={(e) => closeTab(e, tab.id)} className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><XIcon /></button>
                        </div>
                    </div>
                ))}
                <button onClick={addTab} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-white/10 transition-colors ml-1"><Plus /></button>
            </div>

            <div className="flex items-center h-12 px-2 bg-white dark:bg-[#35363a] shadow-sm z-20 space-x-2 border-b border-gray-200 dark:border-black/20">
                <div className="flex space-x-1">
                    <button onClick={handleBack} disabled={activeTab.historyIndex <= 0} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30"><ArrowLeft /></button>
                    <button onClick={handleForward} disabled={activeTab.historyIndex >= activeTab.history.length - 1} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30"><ArrowRight /></button>
                    <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"><RefreshCw /></button>
                </div>
                <button onClick={() => { handleNavigate(''); setView('browser'); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 hidden sm:block"><Home /></button>

                <div className="flex-grow flex items-center bg-[#f1f3f4] dark:bg-[#202124] rounded-full px-3 h-8 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-black transition-all shadow-inner relative">
                    <div className="text-gray-500 mr-2 flex items-center space-x-1">
                        {isNetworkActive ? <ActivityIcon /> : (activeTab.url && activeTab.url.startsWith('https') ? <LockIcon /> : <InfoIcon />)}
                    </div>
                    <input
                        type="text"
                        value={addressBarInput}
                        onChange={(e) => setAddressBarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigate((e.target as HTMLInputElement).value)}
                        onFocus={(e) => e.target.select()}
                        className="flex-grow bg-transparent border-none outline-none text-sm text-black dark:text-white w-full"
                        placeholder="Search or type URL"
                    />
                    <button onClick={toggleBookmark} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"><StarIcon filled={bookmarks.some(b => b.url === activeTab.displayUrl)} /></button>
                </div>

                <div className="flex space-x-1 items-center pl-2">
                    <div className="relative" ref={accountRef}>
                        <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"><UserIcon /></button>
                        {accountMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#35363a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                    <p className="font-bold">{user?.username}</p>
                                    <p className="text-xs text-gray-500">LynixWeb v1.502</p>
                                </div>
                                <button onClick={() => { setView('history'); setAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><GlobeIcon /><span>Cloud History</span></button>
                                <button onClick={() => { setView('bookmarks'); setAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><StarIcon /><span>Bookmarks</span></button>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={settingsRef}>
                        <button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"><MoreVertical /></button>
                        {settingsMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#35363a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50">
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <span className="text-sm font-medium">Security Bypass</span>
                                    <button onClick={() => setSecurityBypassEnabled(!securityBypassEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${securityBypassEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${securityBypassEnabled ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="px-4 py-2">
                                    <label className="text-xs text-gray-500 block mb-1">YouTube API Key</label>
                                    <input type="password" value={youtubeApiKey} onChange={(e) => saveYoutubeKey(e.target.value)} placeholder="Paste key..." className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs"/>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                <button onClick={() => { setView('cookies'); setSettingsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><CookieIcon /><span>Cookie Manager</span></button>
                                <button onClick={() => { setView('history'); setSettingsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center space-x-2"><HistoryIcon /><span>History</span></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex-grow relative bg-white dark:bg-[#202124] w-full h-full overflow-hidden">
                {view === 'browser' ? (
                    <>
                        {activeTab.url === YOUTUBE_SEARCH_URL ? (
                            <YouTubeSearchView apiKey={youtubeApiKey} onNavigate={(url) => handleNavigate(url)} />
                        ) : activeTab.url.startsWith(YOUTUBE_WATCH_URL_PREFIX) ? (
                            <YouTubeWatchView apiKey={youtubeApiKey} videoId={new URL(activeTab.url.replace('internal://', 'https://')).searchParams.get('v') || ''} onNavigate={(url) => handleNavigate(url)} />
                        ) : (
                            <>
                                {shouldUseLoader && <BrowserLoader key={`${activeTabId}-${activeTab.url}-${activeTab.navigationId}`} url={activeTab.displayUrl} onComplete={handleLoaderComplete} />}
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
                                                <input type="text" placeholder="Search Bing or type a URL" className="w-full pl-12 pr-5 py-3 rounded-full border border-gray-200 dark:border-gray-500 bg-white dark:bg-[#202124] focus:outline-none dark:text-white transition-shadow shadow-sm" onKeyDown={(e) => e.key === 'Enter' && handleNavigate((e.target as HTMLInputElement).value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="p-8 overflow-y-auto h-full">
                        {view === 'history' && (<div><h2 className="text-2xl font-bold mb-4">History</h2><button onClick={clearHistory} className="mb-4 px-3 py-2 bg-red-600 text-white rounded text-sm">Clear History</button><ul className="space-y-2">{cloudHistory.map((h, i) => <li key={i} className="truncate border-b py-2 cursor-pointer hover:text-blue-500" onClick={() => { handleNavigate(h); setView('browser'); }}>{h}</li>)}</ul></div>)}
                        {view === 'bookmarks' && (<div><h2 className="text-2xl font-bold mb-4">Bookmarks</h2><ul className="space-y-2">{bookmarks.map((b, i) => <li key={i} className="truncate border-b py-2 cursor-pointer hover:text-blue-500" onClick={() => { handleNavigate(b.url); setView('browser'); }}>{b.title}</li>)}</ul></div>)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

const YouTubeWatchView: React.FC<{ videoId: string; apiKey: string; onNavigate: (url: string) => void }> = ({ videoId, apiKey, onNavigate }) => {
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
                // 1. Fetch Metadata
                const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`);
                const vidData = await vidRes.json();
                if (!vidData.items?.length) throw new Error("Video not found");
                const videoDetails = vidData.items[0];
                setVideo(videoDetails);

                const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoDetails.snippet.channelId}&key=${apiKey}`);
                const channelData = await channelRes.json();
                if (channelData.items?.length) setChannel(channelData.items[0]);

                const commentsRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${apiKey}`);
                const commentsData = await commentsRes.json();
                if (commentsData.items) setComments(commentsData.items);

                const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoDetails.snippet.title)}&type=video&maxResults=10&key=${apiKey}`);
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
        <div className="flex flex-col h-full bg-[#0f0f0f] text-white font-sans overflow-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 flex flex-row gap-6">
                <div className="w-64 flex-shrink-0 hidden lg:block space-y-2">
                    <div className="bg-[#7c3aed] rounded-xl p-4 mb-4 text-center shadow-lg"><h1 className="text-2xl font-bold mb-1 text-white">Parsoley</h1><p className="text-xs text-purple-200">A Lynix YouTube Player</p></div>
                    <button onClick={() => onNavigate(YOUTUBE_SEARCH_URL)} className="w-full text-left px-4 py-3 bg-[#272727] hover:bg-[#3f3f3f] rounded-xl font-semibold">Home</button>
                    <div className="mt-6"><h3 className="text-sm font-bold text-gray-400 mb-3 px-2">Recommendations</h3><div className="space-y-3">{recommendations.slice(0, 5).map(rec => (<div key={rec.id.videoId} className="cursor-pointer group" onClick={() => onNavigate(`https://youtube.com/watch?v=${rec.id.videoId}`)}><div className="aspect-video bg-black rounded-lg overflow-hidden mb-1"><img src={rec.snippet.thumbnails.high.url} className="w-full h-full object-cover" /></div><p className="text-xs font-semibold line-clamp-2 group-hover:text-blue-400">{rec.snippet.title}</p></div>))}</div></div>
                </div>
                <div className="flex-grow max-w-5xl mx-auto">
                    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-4 relative group">
                        <iframe src={embedUrl} title={video.snippet.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white text-black p-4 rounded-xl flex flex-col justify-center items-center text-center shadow-lg border-l-8 border-green-500"><div className="text-3xl font-bold">{formatNumber(video.statistics.likeCount)}</div><div className="text-sm font-semibold text-gray-600">Likes</div></div>
                        <div className="bg-white text-black p-4 rounded-xl flex flex-col justify-center items-center text-center shadow-lg border-t-8 border-blue-500"><div className="font-bold text-lg">@{channel?.snippet.customUrl || video.snippet.channelTitle}</div><div className="text-sm text-gray-600">{video.snippet.channelTitle}</div>{channel && <img src={channel.snippet.thumbnails.default.url} className="w-10 h-10 rounded-full mt-2" />}</div>
                        <div className="bg-white text-black p-4 rounded-xl flex flex-col justify-center items-center text-center shadow-lg border-r-8 border-purple-500"><div className="text-lg font-bold">Comments: {formatNumber(video.statistics.commentCount)}</div><div className="text-lg font-bold">Views: {formatNumber(video.statistics.viewCount)}</div></div>
                    </div>
                    <div className="bg-[#7c3aed] text-white p-6 rounded-xl shadow-lg mb-4"><div className="font-bold mb-2">Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}</div><div className="text-sm whitespace-pre-wrap leading-relaxed"><span className="font-bold">Description:</span> {video.snippet.description}</div></div>
                    <div className="bg-[#272727] p-6 rounded-xl shadow-lg"><h3 className="text-lg font-bold mb-4">--- Comments ---</h3>{comments.length > 0 ? (<div className="space-y-4">{comments.slice(0, 10).map(comment => (<div key={comment.id} className="text-sm"><span className="font-bold text-gray-300">@{comment.snippet.topLevelComment.snippet.authorDisplayName}</span><span className="mx-2">-</span><span className="text-gray-400" dangerouslySetInnerHTML={{__html: comment.snippet.topLevelComment.snippet.textDisplay}}></span></div>))}</div>) : (<p className="text-gray-500">No comments.</p>)}</div>
                </div>
            </div>
        </div>
    );
};

export default LynixBrowserApp;
