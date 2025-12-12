
import React, { useState, useEffect } from 'react';
import { Page, DriveFile } from '../../types';
import { database } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiGalleryAppProps {
    navigate: (page: Page) => void;
}

const MobiGalleryApp: React.FC<MobiGalleryAppProps> = ({ navigate }) => {
    const { user } = useAuth();
    const [images, setImages] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Fetch images
            database.getDriveFiles("mimeType contains 'image/' and trashed=false").then(res => {
                if (res.files) setImages(res.files.sort((a,b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()));
                setLoading(false);
            });
        }
    }, [user]);

    return (
        <div className="w-full h-full flex flex-col bg-black text-white font-sans">
            <header className="p-4 flex items-center bg-black/80 backdrop-blur-md z-10 sticky top-0">
                <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                <h1 className="ml-4 text-xl font-semibold">Photos</h1>
            </header>

            <main className="flex-grow overflow-y-auto p-1">
                {loading ? (
                    <div className="text-center mt-20 text-gray-500">Loading Photos...</div>
                ) : images.length === 0 ? (
                    <div className="text-center mt-20 text-gray-500">No photos found in Drive.</div>
                ) : (
                    <div className="grid grid-cols-3 gap-1">
                        {images.map(img => (
                            <div key={img.id} className="aspect-square bg-gray-900 relative overflow-hidden group cursor-pointer" onClick={() => window.open(img.webViewLink, '_blank')}>
                                <img src={img.iconLink.replace('16', '256')} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={img.name} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MobiGalleryApp;
