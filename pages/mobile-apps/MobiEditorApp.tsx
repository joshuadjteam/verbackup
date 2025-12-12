
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Page } from '../../types';
import { database } from '../../services/database';

const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiEditorAppProps {
    navigate: (page: Page, params?: any) => void;
    initialFileId?: string | null;
    title?: string;
}

const MobiEditorApp: React.FC<MobiEditorAppProps> = ({ navigate, initialFileId, title }) => {
    const { user } = useAuth();
    const [fileId, setFileId] = useState(initialFileId || null);
    const [fileName, setFileName] = useState(title || '');
    const [content, setContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFile = async () => {
            if (initialFileId && user) {
                setIsLoading(true);
                setFileId(initialFileId);
                const { file } = await database.getDriveFileDetails(initialFileId);
                if (file) { setContent(file.content); setFileName(file.name); setIsDirty(false); }
                setIsLoading(false);
            } else if (user) {
                setIsLoading(false);
            }
        };
        loadFile();
    }, [initialFileId, user]);

    const handleSave = async () => {
        if (!user || !fileId) return;
        const { success } = await database.updateDriveFile(fileId, { content });
        if (success) setIsDirty(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
            <header className="flex-shrink-0 p-4 flex items-center justify-between bg-[#1e1e1e] shadow-sm">
                <button onClick={() => navigate('app-files')} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                <div className="font-medium truncate max-w-[200px]">{fileName}</div>
                <button onClick={handleSave} disabled={!isDirty} className={`p-2 rounded-full ${isDirty ? 'text-blue-400 hover:bg-blue-900/20' : 'text-gray-600'}`}>
                    <SaveIcon />
                </button>
            </header>
            
            <main className="flex-grow relative">
                <textarea
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                    className="w-full h-full p-4 resize-none bg-transparent font-mono text-sm focus:outline-none text-gray-200 leading-relaxed"
                    spellCheck="false"
                    placeholder={isLoading ? "Loading..." : "Start typing..."}
                    disabled={!fileId || isLoading}
                />
            </main>
        </div>
    );
};

export default MobiEditorApp;
