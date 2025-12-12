
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, wallpapers } from '../../hooks/useTheme';
import { Page } from '../../types';
import { database } from '../../services/database';

// Icons
const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const GoogleIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64,15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,5 12,5C14.6,5 16.1,6.2 17.1,7.2L19,5.2C17.2,3.4 14.8,2 12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,11.63 21.95,11.36 21.89,11.1H21.35Z" fill="currentColor"/></svg>;


const SecurityTabContent: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setIsSuccess(false);
        if (newPassword !== confirmPassword) { setMessage("New passwords don't match."); return; }
        if (newPassword.length < 6) { setMessage("New password must be at least 6 characters."); return; }

        setIsLoading(true);
        const { error } = await database.updateUserPassword(currentPassword, newPassword);
        setIsLoading(false);

        if (error) {
            setMessage(error);
        } else {
            setIsSuccess(true); setMessage("Password updated successfully!");
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        }
    };

    return (
        <div className="animate-fade-in">
            <h3 className="font-semibold mb-2">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2" required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2" required />
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2" required />
                {message && <p className={`text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-800 flex items-center justify-center space-x-2">
                    <KeyIcon />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
            </form>
        </div>
    );
};

interface MobiProfilePageProps {
    navigate: (page: Page) => void;
}

const MobiProfilePage: React.FC<MobiProfilePageProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const { wallpaper, setWallpaper } = useTheme();
    
    const [driveLinked, setDriveLinked] = useState(false);
    const [isCheckingDrive, setIsCheckingDrive] = useState(true);
    const [driveStatus, setDriveStatus] = useState('');

    useEffect(() => {
        database.isDriveLinked().then(linked => {
            setDriveLinked(linked);
            setIsCheckingDrive(false);
        });
    }, []);
    
    const handleLinkDrive = async () => {
        setDriveStatus('Redirecting to Google...');
        const config = await database.getDriveOAuthConfig();
        if (!config) { setDriveStatus('Error: Could not get config.'); return; }
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive')}&access_type=offline&prompt=consent&state=app-files`;
        window.location.href = oauthUrl;
    };

    const handleUnlinkDrive = async () => {
        if (window.confirm('Are you sure you want to unlink your Google Drive account?')) {
            setDriveStatus('Unlinking...');
            const { success } = await database.unlinkDrive();
            if (success) {
                setDriveLinked(false);
                setDriveStatus('Unlinked successfully.');
            } else {
                setDriveStatus('Error: Failed to unlink.');
            }
            setTimeout(() => setDriveStatus(''), 3000);
        }
    };

    const handleSignOut = () => { logout(); navigate('home'); };

    return (
        <div className="w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800 text-light-text dark:text-dark-text">
            <header className="flex-shrink-0 bg-white dark:bg-gray-900 shadow-md p-4 flex items-center justify-between">
                <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><BackIcon /></button>
                <h1 className="text-xl font-bold">My Profile</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-6">
                 <section className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Account Services</h2>
                    
                    {/* Google Drive */}
                    <div>
                         <h3 className="font-semibold mb-2">Google Drive</h3>
                         {isCheckingDrive ? <p className="text-sm text-gray-500">Checking status...</p> : 
                            driveLinked ? (
                                <button onClick={handleUnlinkDrive} className="w-full text-sm bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700">Unlink Google Drive</button>
                            ) : (
                                <button onClick={handleLinkDrive} className="w-full text-white bg-[#4285F4] hover:bg-[#357ae8] font-semibold py-2 px-4 rounded-md flex items-center justify-center space-x-2">
                                    <GoogleIcon />
                                    <span>Link Google Drive</span>
                                </button>
                            )
                         }
                         {driveStatus && <p className="text-xs text-center text-gray-500 mt-1">{driveStatus}</p>}
                    </div>
                </section>
                
                 <section className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Appearance</h2>
                    <h3 className="font-semibold mb-2">Mobile Wallpaper</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(wallpapers).map(([key, value]) => (
                            <button key={key} onClick={() => setWallpaper(key)} className={`p-1 border-2 rounded-lg ${wallpaper === key ? 'border-blue-500' : 'border-transparent'}`}>
                                <div className={`w-full h-16 rounded ${value.class}`}></div>
                                <span className="text-xs mt-1">{value.name}</span>
                            </button>
                        ))}
                    </div>
                </section>
                
                <section className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Account Information</h2>
                    <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                        <div className="flex justify-between"><span className="font-semibold text-gray-800 dark:text-gray-100">Username:</span><span>{user?.username}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-800 dark:text-gray-100">Email:</span><span className="truncate">{user?.email}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-800 dark:text-gray-100">Role:</span><span>{user?.role}</span></div>
                        <div className="flex justify-between items-center"><span className="font-semibold text-gray-800 dark:text-gray-100">Phone:</span><span className="text-blue-400 font-mono">{user?.phone_number || 'N/A'}</span></div>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
                    <SecurityTabContent />
                </section>
                
                 <div className="pt-4">
                     <button onClick={handleSignOut} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                        <SignOutIcon />
                        <span>Sign Out</span>
                    </button>
                 </div>
            </main>
        </div>
    );
};

export default MobiProfilePage;