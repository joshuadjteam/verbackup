import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Import DriveFile from types.ts
import { Page, DriveFile } from '../../types';
import { database } from '../../services/database';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const GoogleIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64,15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,5 12,5C14.6,5 16.1,6.2 17.1,7.2L19,5.2C17.2,3.4 14.8,2 12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,11.63 21.95,11.36 21.89,11.1H21.35Z" fill="#fff"/>
    </svg>
);


interface FileExplorerAppProps {
    navigate: (page: Page, params?: any) => void;
}

const EDITABLE_MIME_TYPES = [
    'text/plain',
    'text/markdown',
    'text/html',
    'text/css',
    'application/javascript',
    'application/json'
];

const FileExplorerApp: React.FC<FileExplorerAppProps> = ({ navigate }) => {
    const [driveLinkStatus, setDriveLinkStatus] = useState<'checking' | 'unlinked' | 'linked'>('checking');
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(false);
    const [driveError, setDriveError] = useState('');

    const fetchDriveFiles = useCallback(async () => {
        setIsFilesLoading(true);
        setDriveError('');
        const result = await database.getDriveFiles();
        if (result.files) {
            setDriveFiles(result.files.sort((a,b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()));
        } else {
            setDriveError(result.error || 'Failed to load files.');
            if (result.reauth) {
                setDriveLinkStatus('unlinked');
            }
        }
        setIsFilesLoading(false);
    }, []);

    const checkDriveStatus = useCallback(async () => {
        setDriveLinkStatus('checking');
        const isLinked = await database.isDriveLinked();
        setDriveLinkStatus(isLinked ? 'linked' : 'unlinked');
    }, []);
    
    useEffect(() => {
        checkDriveStatus();
    }, [checkDriveStatus]);
    
    useEffect(() => {
        if (driveLinkStatus === 'linked') {
            fetchDriveFiles();
        }
    }, [driveLinkStatus, fetchDriveFiles]);

    const handleLinkDrive = async () => {
        const config = await database.getDriveOAuthConfig();
        if (!config) {
            alert('Could not retrieve Google Drive configuration from the server. Please try again later.');
            return;
        }

        const { clientId, redirectUri } = config;
        const scope = 'https://www.googleapis.com/auth/drive';
        const state = 'app-files';
        
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

        window.location.href = oauthUrl;
    };

    const handleUnlinkDrive = async () => {
        if (window.confirm('Are you sure you want to unlink your Google Drive account?')) {
            const { success } = await database.unlinkDrive();
            if (success) {
                setDriveLinkStatus('unlinked');
            } else {
                alert('Failed to unlink your account. Please try again.');
            }
        }
    };

    const handleCreateFile = async () => {
        const name = window.prompt("Enter a name for the new file (e.g., document.txt):");
        if (name) {
            const { file, error } = await database.createDriveFile(name);
            if (error) {
                setDriveError(`Failed to create file: ${error}`);
            } else {
                fetchDriveFiles(); // Refresh list
            }
        }
    };
    
    const handleDeleteFile = async (fileId: string) => {
        if (window.confirm(`Are you sure you want to delete this file from your Google Drive?`)) {
            const { success, error } = await database.deleteDriveFile(fileId);
            if (success) {
                fetchDriveFiles();
            } else {
                setDriveError(error || 'Failed to delete file.');
            }
        }
    };

    const renderContent = () => {
        if (driveLinkStatus === 'checking' || (driveLinkStatus === 'linked' && isFilesLoading)) {
            return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div><p className="ml-4">{driveLinkStatus === 'checking' ? 'Checking connection...' : 'Fetching files...'}</p></div>;
        }
        if (driveLinkStatus === 'unlinked') {
            return (
                 <div className="flex flex-col items-center justify-center text-center h-full">
                    <CloudIcon />
                    <h1 className="text-3xl font-bold mt-4">Connect to Google Drive</h1>
                    <p className="mt-2 max-w-md text-gray-600 dark:text-gray-300">Link your account to view and manage your cloud files directly here.</p>
                    <button onClick={handleLinkDrive} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-3"><GoogleIcon /><span>Link with Google</span></button>
                </div>
            );
        }
        if (driveError) {
             return <div className="h-full flex items-center justify-center text-red-500"><p>{driveError}</p></div>;
        }
        return driveFiles.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {driveFiles.map(file => {
                    const isEditable = EDITABLE_MIME_TYPES.includes(file.mimeType);
                    const FileItem = (
                        <div key={file.id} className="group relative bg-white/50 dark:bg-black/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl p-4 flex flex-col items-center text-center transition-colors cursor-pointer"
                             onClick={isEditable ? () => navigate('app-editor', { initialFileId: file.id, title: file.name }) : () => window.open(file.webViewLink, '_blank')}>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }} className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white" title="Delete File"><TrashIcon /></button>
                            <img src={file.iconLink} alt="" className="h-12 w-12" />
                            <h3 className="mt-2 font-medium truncate w-full" title={file.name}>{file.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                        </div>
                    );
                    return isEditable ? FileItem : <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="contents">{FileItem}</a>
                })}
            </div>
        ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10"><p>No files found in your Google Drive.</p></div>
        );
    };

    return (
        <div className="w-full h-full p-6 bg-dark-bg text-light-text dark:text-white flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2 flex-shrink-0">
                 <h1 className="text-3xl font-bold">File Explorer</h1>
                 {driveLinkStatus === 'linked' && (
                    <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">
                            <CheckCircleIcon />
                            <span>Google Drive Connected</span>
                            <button onClick={handleUnlinkDrive} className="text-xs text-gray-500 hover:underline">(unlink)</button>
                        </div>
                         <button onClick={handleCreateFile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                            <PlusIcon />
                            <span>Add File to Drive</span>
                        </button>
                    </div>
                 )}
            </div>
             <div className="flex-grow overflow-y-auto custom-scrollbar pt-2 border-t border-gray-300 dark:border-teal-700/50">
                {renderContent()}
            </div>
        </div>
    );
};

export default FileExplorerApp;