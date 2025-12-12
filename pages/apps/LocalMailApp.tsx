import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { Mail, MailAccount } from '../../types';

// Icons
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ComposeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

type MailView = 'inbox' | 'sent' | 'spam' | 'compose';

// A local type to represent both local and external accounts for the UI
type UI_Account = {
    id?: number; // For external accounts
    name: string; // display name
    email: string; // sending address
    folders: string[];
};


const wallpapers: Record<string, { name: string; style: React.CSSProperties }> = {
    none: { name: 'None', style: {} },
    dots: { name: 'Dots', style: { backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle fill="%23a1a1aa" cx="10" cy="10" r="1"/></svg>`)}` } },
    grid: { name: 'Grid', style: { backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M 10 0 L 10 20 M 0 10 L 20 10" stroke-width="0.5" stroke="%23a1a1aa"/></svg>`)}` } },
    plus: { name: 'Plus', style: { backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M 10 0 L 10 20 M 0 10 L 20 10" stroke-width="1" stroke="%23a1a1aa"/></svg>`)}`, backgroundSize: '15px 15px' } },
};

const themes: Record<string, { name: string; classes: string, lightBg: string, darkBg: string }> = {
    system: { name: 'System', classes: 'text-light-text dark:text-white', lightBg: 'bg-light-card', darkBg: 'dark:bg-teal-800' },
    light: { name: 'Light', classes: 'text-gray-800', lightBg: 'bg-white', darkBg: 'dark:bg-white' },
    dark: { name: 'Dark', classes: 'text-gray-200', lightBg: 'bg-gray-800', darkBg: 'dark:bg-gray-800' },
    green: { name: 'Green', classes: 'text-green-900 dark:text-green-100', lightBg: 'bg-green-100', darkBg: 'dark:bg-green-900' },
    blue: { name: 'Blue', classes: 'text-blue-900 dark:text-blue-100', lightBg: 'bg-blue-100', darkBg: 'dark:bg-blue-900' },
    purple: { name: 'Purple', classes: 'text-purple-900 dark:text-purple-100', lightBg: 'bg-purple-100', darkBg: 'dark:bg-purple-900' },
};

interface MailSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userDisplayName: string;
    setUserDisplayName: (name: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    wallpaper: string;
    setWallpaper: (wallpaper: string) => void;
}

const MailSettingsModal: React.FC<MailSettingsModalProps> = ({
    isOpen, onClose,
    userDisplayName, setUserDisplayName, theme, setTheme, wallpaper, setWallpaper
}) => {
    const [activeTab, setActiveTab] = useState('display');

    const TabButton: React.FC<{ tabName: string; label: string; }> = ({ tabName, label }) => (
        <button onClick={() => setActiveTab(tabName)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
            {label}
        </button>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-card dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-[90vh] max-h-[700px] flex flex-col text-light-text dark:text-white">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Mail Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                </div>
                <div className="flex flex-grow overflow-hidden">
                    <div className="w-1/4 p-4 border-r border-gray-200 dark:border-slate-700">
                        <nav className="space-y-1">
                            <TabButton tabName="display" label="Display Name" />
                            <TabButton tabName="wallpaper" label="Wallpaper" />
                            <TabButton tabName="theme" label="Theme" />
                        </nav>
                    </div>
                    <div className="w-3/4 p-6 flex flex-col overflow-y-auto">
                        {activeTab === 'display' && (
                             <div>
                                <h3 className="text-lg font-semibold mb-2">Set Display Name</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This name is shown for your LocalMail account.</p>
                                <input type="text" value={userDisplayName} onChange={e => setUserDisplayName(e.target.value)} className="w-full max-w-sm bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2" />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Changes are saved automatically.</p>
                            </div>
                        )}
                         {activeTab === 'wallpaper' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Choose a Wallpaper</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(wallpapers).map(([key, { name, style }]) => (
                                        <button key={key} onClick={() => setWallpaper(key)} className={`p-2 border-2 rounded-lg flex flex-col items-center hover:border-blue-500 ${wallpaper === key ? 'border-blue-500' : 'border-transparent'}`}>
                                            <div className="w-full h-20 rounded-md bg-gray-200 dark:bg-slate-700" style={{...style, backgroundSize: 'cover' }}></div>
                                            <span className="text-sm mt-2">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )}
                         {activeTab === 'theme' && (
                             <div>
                                <h3 className="text-lg font-semibold mb-4">Choose a Theme</h3>
                                <div className="space-y-2">
                                    {Object.entries(themes).map(([key, { name, lightBg, darkBg }]) => {
                                        return (
                                            <button key={key} onClick={() => setTheme(key)} className={`w-full max-w-sm p-2 flex items-center space-x-4 rounded-lg border-2 hover:border-blue-500 ${theme === key ? 'border-blue-500' : 'border-transparent'}`}>
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex">
                                                    <div className={`w-1/2 h-full ${lightBg}`} />
                                                    <div className={`w-1/2 h-full ${darkBg.replace('dark:', '')}`} />
                                                </div>
                                                <span className="font-medium">{name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ComposeView: React.FC<{ onMailSent: () => void, availableSenders: UI_Account[] }> = ({ onMailSent, availableSenders }) => {
    const { user } = useAuth();
    const from = availableSenders[0]?.email || '';
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient || !user) {
            setStatus('Recipient is required.');
            return;
        }
        setStatus('Sending...');
        const mail = await database.sendMail({ sender: from, recipient, subject, body });
        if (mail) {
            setStatus('Mail sent successfully!');
            setTimeout(() => {
                onMailSent();
            }, 1000);
        } else {
            setStatus('Failed to send mail.');
        }
    };

    return (
        <form onSubmit={handleSend} className="flex-grow flex flex-col p-6 overflow-hidden">
            <h2 className="text-2xl font-bold mb-4">New Message</h2>
            <div className="space-y-3">
                <div className="flex items-center">
                    <label htmlFor="from-select" className="pr-2 text-sm opacity-80">From:</label>
                    <div className="flex-grow p-2 bg-black/10 border-b-2 border-current border-opacity-10">
                        {availableSenders[0] ? `${availableSenders[0].name} <${availableSenders[0].email}>` : '...'}
                    </div>
                </div>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="To (username or email)" className="w-full p-2 bg-black/10 border-b-2 border-current border-opacity-20 focus:outline-none focus:border-opacity-50" />
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full p-2 bg-black/10 border-b-2 border-current border-opacity-20 focus:outline-none focus:border-opacity-50" />
            </div>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your message..." className="flex-grow w-full p-2 bg-black/10 mt-4 focus:outline-none resize-none" />
            <div className="flex items-center justify-between mt-4">
                <p className="text-sm">{status}</p>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                    <SendIcon />
                    <span>Send</span>
                </button>
            </div>
        </form>
    );
};

const LocalMailApp: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [view, setView] = useState<MailView>('inbox');
    const [inbox, setInbox] = useState<Mail[]>([]);
    const [sent, setSent] = useState<Mail[]>([]);
    const [spam, setSpam] = useState<Mail[]>([]);
    const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [theme, setTheme] = useState('system');
    const [wallpaper, setWallpaper] = useState('none');
    const [userDisplayName, setUserDisplayName] = useState(currentUser?.username || 'user');

    const [accounts, setAccounts] = useState<UI_Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<UI_Account | null>(null);
    
    const fetchMails = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        const { inbox, sent } = await database.getMailsForUser(currentUser.username);
        setInbox(inbox);
        setSent(sent);
        setSpam([]); // Placeholder for spam
        setIsLoading(false);
    }, [currentUser]);
    
    const fetchAccounts = useCallback(async () => {
        if (!currentUser) return;
        const localAccount: UI_Account = {
            id: undefined,
            name: userDisplayName,
            email: `${currentUser.username}@lynix.local`,
            folders: ['Inbox', 'Spam', 'Sent'],
        };
        setAccounts([localAccount]);
        setSelectedAccount(localAccount);
    }, [currentUser, userDisplayName]);


    useEffect(() => {
        fetchMails();
        fetchAccounts();
    }, [fetchMails, fetchAccounts]);

    const handleSelectMail = async (mail: Mail) => {
        setSelectedMail(mail);
        if (!mail.read && mail.recipient === currentUser?.username) {
            await database.markMailAsRead(mail.id);
            setInbox(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
        }
    };
    
    const handleDeleteMail = async (mailId: number) => {
        if (window.confirm("Are you sure you want to delete this email?")) {
            await database.deleteMail(mailId);
            setSelectedMail(null);
            fetchMails();
        }
    };

    const handleMailSent = () => {
        setView('sent');
        setSelectedMail(null);
        fetchMails();
    }

    const currentMailList = (() => {
        const list = view === 'inbox' ? inbox : view === 'sent' ? sent : spam;
        // Only show local mail (where account_id is null/undefined)
        return list.filter(m => !m.account_id);
    })();

    return (
        <div 
            className={`w-full h-full flex transition-colors duration-300 ${themes[theme].classes}`} 
            style={wallpapers[wallpaper].style}
        >
            <div className="w-7/12 flex-shrink-0 flex">
                 <div className="w-1/3 border-r border-current border-opacity-20 flex flex-col">
                    <div className="p-4 border-b border-current border-opacity-20 flex justify-between items-center">
                        <h2 className="text-xl font-bold">LocalMail</h2>
                        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-white/20"><SettingsIcon /></button>
                    </div>
                    <div className="p-2">
                        <button onClick={() => { setView('compose'); setSelectedMail(null); }} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <ComposeIcon />
                            <span>Compose</span>
                        </button>
                    </div>
                    <nav className="flex-grow overflow-y-auto">
                        {accounts.map(account => (
                            <div key={account.email}>
                                <div className="w-full text-left p-3 font-semibold">
                                    <span>{account.name}</span>
                                </div>
                                <div className="pl-6">
                                    {account.folders.map(folder => (
                                        <button key={folder} onClick={() => {
                                            setSelectedAccount(account);
                                            const folderView = folder.toLowerCase() as MailView;
                                            if (['inbox', 'sent', 'spam'].includes(folderView)) {
                                                setView(folderView);
                                                setSelectedMail(null);
                                            }
                                        }} className={`w-full text-left p-2 rounded-md transition-colors text-lg ${view === folder.toLowerCase() ? 'font-bold' : 'hover:bg-white/10'}`}>
                                            {folder}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="w-2/3 border-r border-current border-opacity-20 flex flex-col">
                     <div className="p-4 border-b border-current border-opacity-20">
                        <h3 className="text-lg font-bold capitalize">{view === 'compose' ? 'New Message' : `${selectedAccount?.name} ${view}`}</h3>
                        <p className="text-sm opacity-60">{isLoading ? 'Loading...' : `${currentMailList.length} message(s)`}</p>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (<p className="p-4 text-center">Fetching mail...</p>) : 
                        currentMailList.length > 0 ? (
                            <ul>
                                {currentMailList.map(mail => (
                                    <li key={mail.id} className={`border-b border-current border-opacity-10 ${selectedMail?.id === mail.id ? 'bg-black/10' : ''}`}>
                                        <button onClick={() => handleSelectMail(mail)} className="w-full text-left p-3 hover:bg-black/5">
                                            <div className="flex justify-between items-start">
                                                <p className={`font-semibold truncate ${!mail.read && view === 'inbox' ? 'text-blue-400' : ''}`}>{view === 'inbox' ? mail.sender : mail.recipient}</p>
                                                <p className="text-xs opacity-60 flex-shrink-0 ml-2">{new Date(mail.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <p className={`truncate ${!mail.read && view === 'inbox' ? 'font-semibold' : 'font-normal opacity-80'}`}>{mail.subject || '(no subject)'}</p>
                                            <p className="text-sm opacity-60 truncate">{mail.body}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : ( <p className="p-4 text-center">This folder is empty.</p> )}
                    </div>
                </div>
            </div>

            <div className="w-5/12 flex-shrink-0 flex flex-col">
                {view === 'compose' ? ( <ComposeView onMailSent={handleMailSent} availableSenders={accounts} /> ) : 
                selectedMail ? (
                    <div className="flex-grow flex flex-col p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold">{selectedMail.subject}</h2>
                            <button onClick={() => handleDeleteMail(selectedMail.id)} className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2">
                                <TrashIcon />
                                <span>Delete</span>
                            </button>
                        </div>
                        <div className="text-sm opacity-80 border-b border-current border-opacity-20 pb-4 mb-4">
                            <p><strong>From:</strong> {selectedMail.sender}</p>
                            <p><strong>To:</strong> {selectedMail.recipient}</p>
                            <p><strong>Date:</strong> {new Date(selectedMail.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="whitespace-pre-wrap flex-grow">{selectedMail.body}</div>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center opacity-60">
                        <div>
                            <h2 className="text-xl font-semibold">Select a message to read</h2>
                            <p>Your mail content will be displayed here.</p>
                        </div>
                    </div>
                )}
            </div>
            
            <MailSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userDisplayName={userDisplayName} setUserDisplayName={setUserDisplayName} theme={theme} setTheme={setTheme} wallpaper={wallpaper} setWallpaper={setWallpaper}/>
        </div>
    );
};

export default LocalMailApp;