
import React, { useState, useMemo } from 'react';

interface WebAppViewerProps {
    url: string;
    title: string;
    iconSvg?: string;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ExternalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// List of domains that are known to block iframe embedding.
const BLOCKED_DOMAINS = [
    'x.com', 
    'twitter.com', 
    'facebook.com', 
    'instagram.com', 
    'reddit.com', 
    'discord.com', 
    'discord.gg', 
    'linkedin.com', 
    'whatsapp.com',
    'netflix.com'
];

const WebAppViewer: React.FC<WebAppViewerProps> = ({ url, title, iconSvg }) => {
    // Normalize URL to ensure it has a protocol
    const safeUrl = useMemo(() => {
        if (!url) return '';
        
        // Fix for Google
        if (url.includes('google.') && !url.includes('googleapis')) {
            return 'https://www.google.com/webhp?igu=1';
        }
        
        // Fix for YouTube - Use privacy-enhanced embed
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                let targetUrl = url;
                if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
                const urlObj = new URL(targetUrl);
                
                if (urlObj.hostname.includes('youtu.be')) {
                    // youtu.be/ID -> /embed/ID
                    const videoId = urlObj.pathname.slice(1);
                    let newUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                    // Preserve query params if possible, though embed usually only takes specific ones
                    return newUrl;
                } else if (urlObj.pathname.startsWith('/watch')) {
                    // youtube.com/watch?v=ID -> /embed/ID
                    const videoId = urlObj.searchParams.get('v');
                    if (videoId) {
                        return `https://www.youtube-nocookie.com/embed/${videoId}`;
                    }
                }
                // If it's just youtube.com or a channel page, standard embedding might fail due to X-Frame-Options.
                // We'll let it pass through, but it likely won't load in iframe unless it's /embed.
            } catch (e) {
                // Fallback
            }
        }

        if (url.startsWith('internal://') || url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    }, [url]);

    const handleLaunch = () => {
        // Open as a semi-new tab (popup)
        window.open(safeUrl, title, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1200,height=800');
    };

    if (!safeUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-light-text dark:text-dark-text">
                <p>No URL was provided for this web app.</p>
            </div>
        );
    }

    // Check if this domain is blocked
    const isBlocked = BLOCKED_DOMAINS.some(domain => safeUrl.includes(domain));

    if (isBlocked) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#18191a] p-8 text-center">
                <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col items-center border border-gray-200 dark:border-gray-700">
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                        <WarningIcon />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Website cannot be reachable using the Browser</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {title} uses security headers (X-Frame-Options) that prevent it from opening inside Lynix.
                    </p>
                    <button 
                        onClick={handleLaunch}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                        <span>Open in your browser</span>
                        <ExternalIcon />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="flex-grow relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                    Loading {title}...
                </div>
                <iframe
                    src={safeUrl}
                    className="absolute inset-0 w-full h-full border-0 z-10 bg-white"
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone; geolocation; payment"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </div>
    );
};

export default WebAppViewer;
