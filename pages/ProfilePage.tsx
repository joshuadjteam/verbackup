
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import { geminiService } from '../services/geminiService';
import { database } from '../services/database';
import AppContainer from '../components/AppContainer';

const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const GoogleIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64,15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,5 12,5C14.6,5 16.1,6.2 17.1,7.2L19,5.2C17.2,3.4 14.8,2 12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,11.63 21.95,11.36 21.89,11.1H21.35Z" fill="currentColor"/></svg>;


const InfoTabContent = () => {
    const { user } = useAuth();
    return (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6">Account Information</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div className="grid grid-cols-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Username:</span>
                    <span className="col-span-2">{user?.username}</span>
                </div>
                <div className="grid grid-cols-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Email:</span>
                    <span className="col-span-2">{user?.email}</span>
                </div>
                <div className="grid grid-cols-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Role:</span>
                    <span className="col-span-2">{user?.role}</span>
                </div>
                <div className="grid grid-cols-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Phone Number:</span>
                    <span className="col-span-2 font-mono text-blue-500">{user?.phone_number || 'N/A'}</span>
                </div>
            </div>
        </div>
    )
};

const AccountServicesTabContent = () => {
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

    return (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6">Account Services</h3>
            <div className="space-y-6 max-w-sm">
                <div>
                     <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Google Drive</h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Link your Google Drive to save notes and other files in the cloud.</p>
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
            </div>
        </div>
    );
};


const SecurityTabContent: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);

        if (newPassword !== confirmPassword) {
            setMessage("New passwords don't match.");
            return;
        }
        if (newPassword.length < 6) {
            setMessage("New password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        const { error } = await database.updateUserPassword(currentPassword, newPassword);
        setIsLoading(false);

        if (error) {
            setMessage(error);
        } else {
            setIsSuccess(true);
            setMessage("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
                <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />
                {message && (
                    <p className={`text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
                )}
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-800 flex items-center justify-center space-x-2">
                    <KeyIcon />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
            </form>
        </div>
    );
};


type Message = {
    sender: 'user' | 'ai';
    text: string;
};

const LynxAITabContent = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([{ sender: 'ai', text: 'Hello! I am LynxAI. How can I assist you today?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.getChatAIResponse(input);
            const aiMessage: Message = { sender: 'ai', text: response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I couldn't connect to the AI service." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-[45vh] flex flex-col animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4">LynxAI Portal</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-200 dark:bg-slate-700 rounded-bl-none`}>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex items-center border-t border-gray-300 dark:border-slate-600 pt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask LynxAI anything..."
                    className="flex-grow bg-gray-100 dark:bg-slate-700/50 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading} className="ml-3 w-10 h-10 flex items-center justify-center bg-purple-600 rounded-full hover:bg-purple-700 disabled:bg-slate-500 text-white font-semibold">
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

interface ProfilePageProps {
    navigate: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    
    const handleSignOut = () => {
        logout();
        navigate('home');
    };

    const InfoIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const ServicesIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>;
    const SecurityIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
    const AIIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

    const TabButton: React.FC<{ tabName: string, label: string, icon: React.ReactNode }> = ({ tabName, label, icon }) => (
         <button
            onClick={() => setActiveTab(tabName)}
            className={`w-full p-3 rounded-lg text-left transition-colors font-semibold flex items-center space-x-3 ${
                activeTab === tabName ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <AppContainer className="w-full max-w-5xl p-8 text-light-text dark:text-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold">Welcome, {user?.username}!</h1>
                    <p className="text-gray-600 dark:text-gray-300">This is your personal Lynix portal.</p>
                </div>
                <button onClick={handleSignOut} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                    <SignOutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/4">
                    <div className="space-y-2">
                        <TabButton tabName="info" label="Info" icon={InfoIcon} />
                        <TabButton tabName="services" label="Account Services" icon={ServicesIcon} />
                        <TabButton tabName="security" label="Security" icon={SecurityIcon} />
                        <TabButton tabName="lynxai" label="LynxAI Portal" icon={AIIcon} />
                    </div>
                </div>
                <div className="w-full md:w-3/4 bg-black/5 dark:bg-black/20 rounded-lg p-6 min-h-[45vh]">
                    {activeTab === 'info' && <InfoTabContent />}
                    {activeTab === 'services' && <AccountServicesTabContent />}
                    {activeTab === 'security' && <SecurityTabContent />}
                    {activeTab === 'lynxai' && <LynxAITabContent />}
                </div>
            </div>
        </AppContainer>
    );
};

export default ProfilePage;