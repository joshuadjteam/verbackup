
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { Mail } from '../../types';

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45 -mt-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;

type MailView = 'inbox' | 'sent' | 'spam';
type UIState = 'list' | 'detail' | 'compose';

const MobiLocalMailApp: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [view, setView] = useState<MailView>('inbox');
    const [uiState, setUiState] = useState<UIState>('list');
    const [inbox, setInbox] = useState<Mail[]>([]);
    const [sent, setSent] = useState<Mail[]>([]);
    const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sendStatus, setSendStatus] = useState('');

    const fetchMails = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        const { inbox, sent } = await database.getMailsForUser(currentUser.username);
        setInbox(inbox);
        setSent(sent);
        setIsLoading(false);
    }, [currentUser]);

    useEffect(() => { fetchMails(); }, [fetchMails]);

    const handleSelectMail = async (mail: Mail) => {
        setSelectedMail(mail);
        setUiState('detail');
        if (!mail.read && mail.recipient === currentUser?.username) {
            await database.markMailAsRead(mail.id);
            setInbox(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
        }
    };

    const handleDeleteMail = async (mailId: number) => {
        if (window.confirm("Delete this email?")) {
            await database.deleteMail(mailId);
            setUiState('list'); setSelectedMail(null); fetchMails();
        }
    };
    
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient || !currentUser) { setSendStatus('Recipient is required.'); return; }
        setSendStatus('Sending...');
        const fromEmail = `${currentUser.username}@lynix.local`;
        const mail = await database.sendMail({ sender: fromEmail, recipient, subject, body });
        if (mail) {
            setSendStatus('Sent');
            setTimeout(() => { setRecipient(''); setSubject(''); setBody(''); setUiState('list'); setView('sent'); fetchMails(); }, 1000);
        } else {
            setSendStatus('Failed');
        }
    };

    if (uiState === 'compose') {
        return (
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
                <header className="flex-shrink-0 p-4 flex items-center justify-between">
                    <button onClick={() => setUiState('list')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><BackIcon /></button>
                    <h1 className="text-lg font-normal flex-grow ml-4">Compose</h1>
                    <button onClick={handleSend} className="p-2 rounded-full text-[#0b57cf] hover:bg-[#0b57cf]/10"><SendIcon /></button>
                </header>
                <div className="flex-grow flex flex-col px-4">
                    <div className="border-b border-gray-200 dark:border-gray-800 py-2 flex">
                        <span className="text-gray-500 w-12 pt-2">To</span>
                        <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} className="flex-grow p-2 bg-transparent focus:outline-none" />
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-800 py-2 flex">
                        <span className="text-gray-500 w-12 pt-2">Sub</span>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="flex-grow p-2 bg-transparent focus:outline-none" />
                    </div>
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Compose email" className="flex-grow w-full py-4 bg-transparent focus:outline-none resize-none text-base leading-relaxed" />
                    {sendStatus && <p className="text-sm text-center p-2 text-gray-500">{sendStatus}</p>}
                </div>
            </div>
        );
    }
    
    if (uiState === 'detail' && selectedMail) {
        return (
             <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
                <header className="flex-shrink-0 p-4 flex items-center justify-between">
                    <button onClick={() => setUiState('list')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><BackIcon /></button>
                    <div className="flex space-x-2">
                        <button onClick={() => handleDeleteMail(selectedMail.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><TrashIcon /></button>
                    </div>
                </header>
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-normal leading-tight">{selectedMail.subject || '(No Subject)'}</h1>
                    </div>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-[#c2e7ff] dark:bg-[#004a77] rounded-full flex items-center justify-center text-[#001d35] dark:text-[#c2e7ff] font-bold text-sm">
                            {selectedMail.sender.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between">
                                <span className="font-semibold text-base">{selectedMail.sender}</span>
                                <span className="text-xs text-gray-500">{new Date(selectedMail.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-gray-500">to {selectedMail.recipient}</div>
                        </div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-300">{selectedMail.body}</div>
                </div>
            </div>
        );
    }

    const currentMailList = view === 'inbox' ? inbox : sent;

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans relative">
            <div className="p-4 pb-2">
                <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] rounded-full px-4 py-3 flex items-center shadow-sm space-x-3">
                    <MenuIcon />
                    <input 
                        type="text" 
                        placeholder="Search in mail" 
                        className="bg-transparent flex-grow focus:outline-none text-base" 
                    />
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{currentUser?.username.charAt(0).toUpperCase()}</div>
                </div>
            </div>

            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{view}</div>

            <main className="flex-grow overflow-y-auto">
                {isLoading ? <div className="p-8 text-center text-gray-500">Syncing...</div> : currentMailList.length > 0 ? (
                    <ul className="pb-20">
                        {currentMailList.map(mail => (
                            <li key={mail.id} onClick={() => handleSelectMail(mail)}>
                                <div className={`flex items-start space-x-4 p-4 active:bg-gray-100 dark:active:bg-white/5 ${!mail.read && view === 'inbox' ? 'font-bold' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold flex-shrink-0">
                                        {mail.sender.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between">
                                            <span className={`truncate text-base ${!mail.read && view === 'inbox' ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{mail.sender}</span>
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(mail.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`truncate text-sm ${!mail.read && view === 'inbox' ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{mail.subject || '(no subject)'}</div>
                                        <div className="truncate text-sm text-gray-500">{mail.body}</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <div className="p-10 text-center text-gray-500">Nothing in {view}.</div>}
            </main>

            <div className="absolute bottom-0 left-0 right-0 bg-[#f3f6fc] dark:bg-[#1e1e1e] h-16 flex justify-around items-center border-t border-gray-200 dark:border-[#333]">
                <button onClick={() => setView('inbox')} className={`flex flex-col items-center ${view === 'inbox' ? 'text-[#0b57cf]' : 'text-gray-500'}`}>
                    <div className={`px-4 py-1 rounded-full ${view === 'inbox' ? 'bg-[#c2e7ff] dark:bg-[#004a77]' : ''}`}><span className="font-bold text-sm">Inbox</span></div>
                </button>
                <button onClick={() => setView('sent')} className={`flex flex-col items-center ${view === 'sent' ? 'text-[#0b57cf]' : 'text-gray-500'}`}>
                     <span className="font-medium text-sm">Sent</span>
                </button>
            </div>

            <button onClick={() => setUiState('compose')} className="absolute bottom-20 right-4 bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] px-4 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2">
                <PencilIcon />
                <span className="font-semibold">Compose</span>
            </button>
        </div>
    );
};

export default MobiLocalMailApp;
