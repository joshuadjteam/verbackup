import React, { useState, useEffect, useCallback } from 'react';
import { Page, DriveFile } from '../../types';
import { database } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const DriveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const MoreVertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiFileExplorerAppProps {
    navigate: (page: Page, params?: any) => void;
}

const MobiFileExplorerApp: React.FC<MobiFileExplorerAppProps> = ({ navigate }) => {
    const { user } = useAuth();
    const [driveLinkStatus, setDriveLinkStatus] = useState<'checking' | 'unlinked' | 'linked'>('checking');
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>(''); // For simulating system folder navigation

    const fetchDriveFiles = useCallback(async () => {
        setIsFilesLoading(true);
        const result = await database.getDriveFiles();
        if (result.files) setDriveFiles(result.files);
        else if (result.reauth) setDriveLinkStatus('unlinked');
        setIsFilesLoading(false);
    }, []);

    useEffect(() => {
        database.isDriveLinked().then(linked => {
            setDriveLinkStatus(linked ? 'linked' : 'unlinked');
            if (linked) fetchDriveFiles();
        });
    }, [fetchDriveFiles]);

    const handleLinkDrive = async () => {
        const config = await database.getDriveOAuthConfig();
        if (!config) return;
        const { clientId, redirectUri } = config;
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive')}&access_type=offline&prompt=consent&state=app-files`;
        window.location.href = oauthUrl;
    };

    const handleSystemFolderClick = (folderName: string) => {
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setCurrentPath(newPath);
    };
    
    const goBack = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    // Simulated System Files Logic
    const currentVersion = user?.system_version || '12.0.2';
    
    const renderSystemFiles = () => {
        // Root
        if (!currentPath) {
            return (
                 <div onClick={() => handleSystemFolderClick('mobilauncher')} className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex items-center space-x-4 cursor-pointer">
                    <FolderIcon />
                    <div className="flex-grow">
                        <div className="font-medium">System Root</div>
                        <div className="text-xs text-gray-500">Internal Storage</div>
                    </div>
                </div>
            );
        }

        // Directory listing simulation
        const parts = currentPath.split('/');
        const currentDir = parts[parts.length - 1];

        let contents: { name: string, type: 'folder' | 'file' }[] = [];

        if (currentDir === 'mobilauncher') {
            contents = [{ name: `version${currentVersion}`, type: 'folder' }];
        } else if (currentDir === `version${currentVersion}`) {
            contents = [
                { name: 'apps', type: 'folder' },
                { name: 'components', type: 'folder' },
                { name: 'information', type: 'folder' }
            ];
        } else if (currentDir === 'apps') {
            contents = [
                { name: 'launcher.apk', type: 'file' },
                { name: 'settings.apk', type: 'file' },
                { name: 'phone.apk', type: 'file' }
            ];
        } else if (currentDir === 'components') {
            contents = [
                { name: 'systemui.lib', type: 'file' },
                { name: 'kernel.sys', type: 'file' }
            ];
        } else if (currentDir === 'information') {
            contents = [
                { name: 'build.prop', type: 'file' },
                { name: 'version.xml', type: 'file' }
            ];
        }

        return (
            <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                     <button onClick={goBack} className="mr-2"><BackIcon/></button>
                     <span>/{currentPath}</span>
                </div>
                {contents.map((item, i) => (
                    <div key={i} onClick={() => item.type === 'folder' && handleSystemFolderClick(item.name)} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                        {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                        <span className="font-medium">{item.name}</span>
                    </div>
                ))}
                {contents.length === 0 && <div className="text-gray-500 text-center p-4">Empty Folder</div>}
            </div>
        );
    };

    if (currentPath) {
         return (
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
                <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-800">
                    <button onClick={goBack} className="p-2 mr-2"><BackIcon/></button>
                    <h1 className="text-lg font-bold">Internal Storage</h1>
                </header>
                <main className="flex-grow overflow-y-auto p-4">
                    {renderSystemFiles()}
                </main>
            </div>
         )
    }

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-[#f3f6fc] dark:bg-[#1e1e1e] rounded-full px-4 py-2 flex-grow">
                    <SearchIcon />
                    <span className="text-gray-500 text-base">Search in Drive</span>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4">
                <h2 className="text-lg font-medium mb-4">Categories</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex flex-col">
                        <span className="text-blue-500 text-2xl mb-2">⬇</span>
                        <span className="font-medium text-sm">Downloads</span>
                    </div>
                    <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex flex-col">
                        <span className="text-red-500 text-2xl mb-2">🖼</span>
                        <span className="font-medium text-sm">Images</span>
                    </div>
                    <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex flex-col">
                        <span className="text-green-500 text-2xl mb-2">♫</span>
                        <span className="font-medium text-sm">Audio</span>
                    </div>
                    <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex flex-col">
                        <span className="text-purple-500 text-2xl mb-2">📄</span>
                        <span className="font-medium text-sm">Documents</span>
                    </div>
                </div>

                <h2 className="text-lg font-medium mb-4">Storage Devices</h2>
                <div className="space-y-4 mb-6">
                    {/* System Root Entry */}
                    {renderSystemFiles()}
                    
                    {/* Drive Entry */}
                    {driveLinkStatus === 'linked' ? (
                        <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex items-center space-x-4 cursor-pointer">
                            <DriveIcon />
                            <div className="flex-grow">
                                <div className="font-medium">Google Drive</div>
                                <div className="text-xs text-gray-500">{driveFiles.length} files</div>
                            </div>
                        </div>
                    ) : (
                        <div onClick={handleLinkDrive} className="bg-[#f3f6fc] dark:bg-[#1e1e1e] p-4 rounded-xl flex items-center space-x-4 cursor-pointer">
                            <DriveIcon />
                            <div className="flex-grow">
                                <div className="font-medium">Google Drive</div>
                                <div className="text-xs text-gray-500">Tap to connect</div>
                            </div>
                        </div>
                    )}
                </div>

                {driveLinkStatus === 'linked' && (
                    <>
                        <h2 className="text-lg font-medium mb-4">Recent Files</h2>
                        <div className="space-y-2">
                            {isFilesLoading ? <div className="text-center text-gray-500">Loading Drive...</div> : driveFiles.slice(0, 5).map(file => (
                                <div key={file.id} onClick={() => window.open(file.webViewLink, '_blank')} className="flex items-center space-x-4 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                                    <img src={file.iconLink} className="w-8 h-8" alt="" />
                                    <div className="flex-grow min-w-0">
                                        <div className="font-medium text-sm truncate">{file.name}</div>
                                        <div className="text-xs text-gray-500">{new Date(file.modifiedTime).toLocaleDateString()}</div>
                                    </div>
                                    <MoreVertIcon />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
            
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex justify-around text-xs font-medium text-gray-500">
                <div className="flex flex-col items-center text-[#0b57cf]"><span className="text-xl mb-1">📂</span>Clean</div>
                <div className="flex flex-col items-center"><span className="text-xl mb-1">🔍</span>Browse</div>
                <div className="flex flex-col items-center"><span className="text-xl mb-1">↗</span>Share</div>
            </div>
        </div>
    );
};

export default MobiFileExplorerApp;