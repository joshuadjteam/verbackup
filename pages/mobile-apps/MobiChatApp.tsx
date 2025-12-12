
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { chatService } from '../../services/chatService';
import { geminiService } from '../../services/geminiService';
import { User, ChatMessage, UserRole } from '../../types';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const MoreVertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>;
const StartChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const LynixLogo = () => (
    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
        AI
    </div>
);

const LYNX_AI_USER: User = { id: -1, username: 'Lynx AI', email: 'ai@lynix.local', role: UserRole.Standard, plan_name: 'System', features: { chat: true, ai: true, mail: false }};

interface MobiChatAppProps {
    initialTargetId?: number | null;
}

const MobiChatApp: React.FC<MobiChatAppProps> = ({ initialTargetId }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser && aiHistory.length === 0) {
            setAiHistory([{ id: Date.now(), senderId: LYNX_AI_USER.id, receiverId: currentUser.id, text: "Hello! I'm Lynx AI. How can I help you today?", timestamp: new Date(), sender: LYNX_AI_USER, receiver: currentUser }]);
        }
    }, [currentUser, aiHistory.length]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return;
            const allUsers = await database.getUserDirectory();
            const realUsers = allUsers.filter(u => u.id !== currentUser.id);
            setUsers([LYNX_AI_USER, ...realUsers]);
        };
        fetchUsers();
    }, [currentUser]);

    const handleSelectUser = (user: User) => {
        if (selectedUser?.id !== user.id) setSelectedUser(user);
    };

    useEffect(() => {
        if (initialTargetId !== undefined && initialTargetId !== null && users.length > 0) {
            const target = users.find(u => u.id === initialTargetId);
            if (target) handleSelectUser(target);
        }
    }, [initialTargetId, users]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(scrollToBottom, [messages, isAiThinking]);

    useEffect(() => {
        if (!currentUser || !selectedUser) return;
        if (selectedUser.id === LYNX_AI_USER.id) {
            if (aiHistory.length > 0) setMessages(aiHistory);
            return;
        }
        const chatId = chatService.getChatId(currentUser.id, selectedUser.id);
        let isMounted = true;
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            const history = await chatService.getChatHistory(currentUser.id, selectedUser.id);
            if (isMounted) {
                setMessages(history);
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
        const handleNewMessage = (payload: any) => {
            if (!isMounted) return;
            const incomingMsg: ChatMessage = { id: payload.id, senderId: payload.sender_id, receiverId: payload.receiver_id, text: payload.text, timestamp: new Date(payload.timestamp), sender: payload.sender_id === currentUser.id ? currentUser : selectedUser, receiver: payload.sender_id === currentUser.id ? selectedUser : currentUser };
            setMessages(prev => [...prev, incomingMsg]);
        };
        chatService.subscribe(chatId, handleNewMessage);
        return () => { isMounted = false; chatService.unsubscribe(chatId); };
    }, [currentUser, selectedUser, aiHistory]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedUser) return;
        const textToSend = newMessage.trim();
        setNewMessage('');
        if (selectedUser.id === LYNX_AI_USER.id) {
            const userMsg: ChatMessage = { id: Date.now(), senderId: currentUser.id, receiverId: LYNX_AI_USER.id, text: textToSend, timestamp: new Date(), sender: currentUser, receiver: LYNX_AI_USER };
            const updatedHistory = [...aiHistory, userMsg];
            setAiHistory(updatedHistory);
            setMessages(updatedHistory);
            setIsAiThinking(true);
            try {
                const responseText = await geminiService.getChatAIResponse(textToSend);
                const aiMsg: ChatMessage = { id: Date.now() + 1, senderId: LYNX_AI_USER.id, receiverId: currentUser.id, text: responseText, timestamp: new Date(), sender: LYNX_AI_USER, receiver: currentUser };
                setAiHistory(prev => [...prev, aiMsg]);
                setMessages(prev => [...prev, aiMsg]);
            } catch (error) {
                 const errorMsg: ChatMessage = { id: Date.now() + 1, senderId: LYNX_AI_USER.id, receiverId: currentUser.id, text: "I'm having trouble connecting right now. Please try again later.", timestamp: new Date(), sender: LYNX_AI_USER, receiver: currentUser };
                setAiHistory(prev => [...prev, errorMsg]);
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsAiThinking(false);
            }
        } else {
            const messageData = { senderId: currentUser.id, receiverId: selectedUser.id, text: textToSend };
            const optimisticMsg: ChatMessage = { id: Date.now(), ...messageData, timestamp: new Date(), sender: currentUser, receiver: selectedUser };
            setMessages(prev => [...prev, optimisticMsg]);
            await chatService.sendMessage(messageData);
        }
    };

    if (selectedUser) {
        return (
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
                <header className="flex-shrink-0 p-2 flex items-center space-x-2 bg-white dark:bg-[#121212] shadow-sm z-10">
                    <button onClick={() => setSelectedUser(null)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"> <BackIcon /> </button>
                    <div className="flex items-center space-x-3 flex-grow">
                        {selectedUser.id === LYNX_AI_USER.id ? (
                            <LynixLogo />
                        ) : (
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedUser.username.charAt(0).toUpperCase()}</div>
                        )}
                        <h2 className="text-lg font-normal">{selectedUser.username}</h2>
                    </div>
                    <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><MoreVertIcon/></button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-[#f3f6fc] dark:bg-[#0b0b0b]">
                    {isLoadingHistory ? ( <div className="flex justify-center items-center h-full text-gray-500">Loading conversation...</div> ) : messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-5 py-3 text-[15px] leading-snug rounded-3xl ${
                                msg.senderId === currentUser?.id 
                                    ? 'bg-[#0b57cf] text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-[#303030] text-black dark:text-white rounded-bl-sm shadow-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isAiThinking && ( <div className="flex justify-start"><div className="bg-white dark:bg-[#303030] px-4 py-3 rounded-3xl rounded-bl-sm shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div></div> )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-2 bg-[#f3f6fc] dark:bg-[#0b0b0b] flex-shrink-0 flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Text message" 
                        className="flex-grow bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#444] rounded-full px-6 py-3 focus:outline-none focus:border-[#0b57cf] text-black dark:text-white shadow-sm" 
                        disabled={isAiThinking} 
                    />
                    <button type="submit" disabled={!newMessage.trim() || isAiThinking} className="p-3 bg-[#0b57cf] text-white rounded-full shadow disabled:opacity-50 hover:bg-[#0842a0]"> 
                        <SendIcon /> 
                    </button>
                </form>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
            <header className="p-4 flex-shrink-0 bg-[#f3f6fc] dark:bg-[#121212]">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-full px-4 py-3 flex items-center shadow-sm space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <span className="text-gray-500">Search conversations</span>
                </div>
            </header>
            
            <div className="flex-grow overflow-y-auto">
                <div className="px-4 pb-2">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Messages</h2>
                    <ul className="space-y-1">
                        {users.map(user => (
                            <li key={user.id}>
                                <button onClick={() => handleSelectUser(user)} className="w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center hover:bg-[#f0f4f8] dark:hover:bg-white/5">   
                                    {user.id === LYNX_AI_USER.id ? (
                                        <LynixLogo />
                                    ) : (
                                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</div>
                                    )}
                                    <div className="ml-4 flex-grow">
                                        <span className="font-semibold block text-base">{user.username}</span>
                                        <span className="text-gray-500 text-sm block truncate">Tap to chat</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button className="absolute bottom-6 right-6 bg-[#0b57cf] text-white p-4 rounded-2xl shadow-lg hover:bg-[#0842a0] transition-colors flex items-center space-x-2">
                <StartChatIcon />
                <span className="font-medium">Start chat</span>
            </button>
        </div>
    );
};

export default MobiChatApp;
