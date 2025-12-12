

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Page } from '../../types';
import { database } from '../../services/database';

// Icons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

interface EditorAppProps {
    navigate: (page: Page, params?: any) => void;
    initialFileId?: string | null;
    title?: string;
    closeWindow?: () => void;
}

const EditorApp: React.FC<EditorAppProps> = ({ navigate, initialFileId, title, closeWindow }) => {
    const { user } = useAuth();
    const [fileId, setFileId] = useState(initialFileId || null);
    const [fileName, setFileName] = useState(title || '');
    const [content, setContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const loadFile = async () => {
            if (initialFileId && user) {
                setStatus('Loading file...');
                setIsLoading(true);
                setFileId(initialFileId);

                const { file, error } = await database.getDriveFileDetails(initialFileId);
                if (file) {
                    setContent(file.content);
                    setFileName(file.name);
                    setIsDirty(false);
                    setStatus('');
                } else {
                    setStatus(`Error: ${error || 'Could not load file.'}`);
                }
                setIsLoading(false);
            } else if (user) {
                setStatus('No file selected. Close and open a file from the explorer.');
                setIsLoading(false);
            }
        };
        loadFile();
    }, [initialFileId, user]);

    const handleSave = async () => {
        if (!user || !fileId) return;
        setStatus('Saving...');
        const { success, error } = await database.updateDriveFile(fileId, { content: content, name: fileName });
        if (success) {
            setIsDirty(false);
            setStatus('Saved!');
            setTimeout(() => setStatus(''), 2000);
        } else {
            setStatus(`Error: ${error || 'Failed to save.'}`);
        }
    };

    const handleClose = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close? This will revert your changes.')) {
            return;
        }
        if (closeWindow) {
            closeWindow();
        } else {
            navigate('app-files');
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col bg-light-card dark:bg-dark-bg text-light-text dark:text-dark-text">
            <div className="flex-shrink-0 p-2 border-b border-gray-300 dark:border-slate-700 flex justify-between items-center bg-gray-100 dark:bg-dark-card">
                 <input
                    type="text"
                    value={fileName}
                    onChange={(e) => { setFileName(e.target.value); setIsDirty(true); }}
                    className="text-lg font-bold bg-transparent focus:outline-none p-1 rounded hover:bg-white/10 dark:hover:bg-black/20"
                    disabled={isLoading || !fileId}
                />
                <div className="flex items-center space-x-2">
                    {status && <span className="text-sm text-gray-500">{status}</span>}
                    {isDirty && <span className="text-sm text-yellow-500">*</span>}
                    <button onClick={handleSave} disabled={!fileId || isLoading || !isDirty} className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 disabled:bg-gray-500">
                        <SaveIcon />
                        <span>Save</span>
                    </button>
                    <button onClick={handleClose} className="px-3 py-1 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-2">
                        <CloseIcon />
                        <span>Close</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow p-4">
                <textarea
                    value={content}
                    onChange={e => { setContent(e.target.value); setIsDirty(true); }}
                    className="w-full h-full p-2 resize-none bg-white dark:bg-slate-800 font-mono text-base focus:outline-none rounded-md border border-gray-300 dark:border-slate-600"
                    spellCheck="false"
                    placeholder={isLoading ? "Loading file from Google Drive..." : "Start typing your content here..."}
                    disabled={!fileId || isLoading}
                />
            </div>
        </div>
    );
};

export default EditorApp;