
import React, { useState, useMemo } from 'react';
import { Page } from '../../types';

// Icons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const OpenExternalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

interface MobiWebAppViewerProps {
    url: string;
    title: string;
    iconSvg?: string;
    navigate: (page: Page) => void;
}

const BLOCKED_DOMAINS = [
    'x.com', 
    'twitter.com', 
    'facebook.com', 
    'instagram.com', 
    'reddit.com', 
    'discord.com', 
    'discord.gg', 
    'linkedin.com', 
    'whatsapp.com'
];

const MobiWebAppViewer: React.FC<MobiWebAppViewerProps> = ({ url, title, iconSvg, navigate }) => {
    const [showWarning, setShowWarning] = useState(true);

    // Normalize URL to ensure it has a protocol
    const safeUrl = useMemo(() => {
        if (!url) return '';
        
        // Fix for Google
        if (url.includes('google.') && !url.includes('googleapis')) {
            return 'https://www.google.com/webhp?igu=1';
        }
        
        // Fix for YouTube - Redirect to official embed
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                let targetUrl = url;
                if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
                const urlObj = new URL(targetUrl);
                
                if (urlObj.hostname.includes('youtu.be')) {
                    const videoId = urlObj.pathname.slice(1);
                    return `https://www.youtube-nocookie.com/embed/${videoId}`;
                } else if (urlObj.pathname.startsWith('/watch')) {
                    const videoId = urlObj.searchParams.get('v');
                    if (videoId) {
                        return `https://www.youtube-nocookie.com/embed/${videoId}`;
                    }
                }
            } catch (e) {
                // Fallback
            }
        }

        if (url.startsWith('internal://') || url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    }, [url]);

    const handleOpenExternal = () => {
        window.open(safeUrl, title, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=800');
    };

    if (!safeUrl) {
        return (
            <div className="w-full flex-grow flex flex-col bg-gray-100 dark:bg-gray-800 text-light-text dark:text-dark-text">
                <header className="flex-shrink-0 bg-white dark:bg-gray-900 p-3 flex items-center shadow">
                    <button onClick={() => navigate('home')} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><BackIcon /></button>
                    <h1 className="text-lg font-bold">Error</h1>
                </header>
                <main className="flex-grow flex items-center justify-center">
                     <p>No URL was provided for this web app.</p>
                </main>
            </div>
        );
    }

    const isBlocked = BLOCKED_DOMAINS.some(domain => safeUrl.includes(domain));
    
    return (
        <div className="w-full flex-grow flex flex-col bg-gray-100 dark:bg-gray-800">
            <header className="flex-shrink-0 bg-white dark:bg-gray-900 p-2 flex items-center justify-between shadow-md z-20">
                <div className="flex items-center">
                    <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <BackIcon />
                    </button>
                    <h1 className="ml-2 text-lg font-bold truncate max-w-[180px] text-light-text dark:text-dark-text">{title}</h1>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={handleOpenExternal}
                        className="p-2 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        aria-label="Open in popup"
                    >
                        <OpenExternalIcon />
                    </button>
                </div>
            </header>
            
            <main className="flex-grow flex min-h-0 relative bg-white dark:bg-gray-900">
                {isBlocked ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-100 dark:bg-slate-900">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm flex flex-col items-center">
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <WarningIcon />
                            </div>
                            <h2 className="text-xl font-bold mb-2 dark:text-white">Website cannot be reachable using the Browser</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                                {title} has security settings that prevent it from loading here.
                            </p>
                            <button 
                                onClick={handleOpenExternal}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md active:scale-95 transform flex items-center justify-center space-x-2"
                            >
                                <OpenExternalIcon />
                                <span>Open in your browser</span>
                            </button>
                        </div>
                     </div>
                ) : (
                    <>
                        {/* Persistent warning bar for sites that might block unexpectedly */}
                        {showWarning && (
                            <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs px-3 py-2 flex justify-between items-center z-20">
                                <span className="flex-grow mr-2">If not loading, open externally.</span>
                                <button onClick={() => setShowWarning(false)} className="p-1 hover:bg-white/20 rounded flex-shrink-0">
                                    <XIcon />
                                </button>
                            </div>
                        )}
                        
                        {/* Background hint */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm z-0">
                            Loading {title}...
                        </div>

                        <iframe
                            src={safeUrl}
                            className="w-full flex-grow border-0 relative z-10 bg-white"
                            title={title}
                            scrolling="yes"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone; geolocation; payment; fullscreen; clipboard-read; clipboard-write"
                            referrerPolicy="strict-origin-when-cross-origin"
                            style={{ height: '100%', width: '100%' }}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default MobiWebAppViewer;
