
import React, { useState, useEffect } from 'react';
import { Page, DriveFile } from '../../types';
import { database } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;

interface MobiMusicAppProps {
    navigate: (page: Page) => void;
}

const MobiMusicApp: React.FC<MobiMusicAppProps> = ({ navigate }) => {
    const { user } = useAuth();
    const [tab, setTab] = useState<'drive' | 'spotify'>('drive');
    const [audioFiles, setAudioFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tab === 'drive' && user) {
            setLoading(true);
            // Fetch audio files from Drive
            database.getDriveFiles("mimeType contains 'audio/' and trashed=false").then(res => {
                if (res.files) setAudioFiles(res.files);
                setLoading(false);
            });
        }
    }, [tab, user]);

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
            <header className="p-4 flex items-center justify-between bg-[#1e1e1e] shadow-md">
                <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                <h1 className="text-lg font-bold">Music</h1>
                <div className="w-8"></div>
            </header>

            <div className="flex border-b border-white/10">
                <button onClick={() => setTab('drive')} className={`flex-1 py-3 text-sm font-medium ${tab === 'drive' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}>My Drive</button>
                <button onClick={() => setTab('spotify')} className={`flex-1 py-3 text-sm font-medium ${tab === 'spotify' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}>Spotify</button>
            </div>

            <main className="flex-grow overflow-y-auto relative">
                {tab === 'drive' ? (
                    <div className="p-4">
                        {loading ? <div className="text-center p-4 text-gray-500">Scanning Drive...</div> : audioFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                                <MusicIcon />
                                <p className="mt-2">No audio files found in Drive.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {audioFiles.map(file => (
                                    <div key={file.id} className="bg-[#2c2c2c] p-3 rounded-lg flex items-center justify-between">
                                        <div className="truncate pr-4">
                                            <p className="font-medium text-sm truncate">{file.name}</p>
                                            <p className="text-xs text-gray-400">Google Drive Audio</p>
                                        </div>
                                        <button onClick={() => window.open(file.webViewLink, '_blank')} className="bg-pink-600 p-2 rounded-full text-xs">Play</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <iframe 
                        src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M" 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        allow="encrypted-media"
                        className="absolute inset-0"
                    ></iframe>
                )}
            </main>
        </div>
    );
};

export default MobiMusicApp;
