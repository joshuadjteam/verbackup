import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { chatService } from '../../services/chatService';
import { geminiService } from '../../services/geminiService';
import { User, ChatMessage, UserRole } from '../../types';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

const LynixLogo = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <circle cx="16" cy="16" r="14" fill="#C9E1DE"/>
        <path d="M9 13L19 13L16 23L6 23Z" fill="#EB5B4D"/>
        <path d="M12 8L22 8L19 18L9 18Z" fill="#F37921"/>
    </svg>
);

// Special constant for the AI user
const LYNX_AI_USER: User = {
    id: -1,
    username: 'Lynx AI',
    email: 'ai@lynix.local',
    role: UserRole.Standard,
    plan_name: 'System',
    features: { chat: true, ai: true, mail: false }
};

interface ChatAppProps {
    initialTargetId?: number | null;
}

const ChatApp: React.FC<ChatAppProps> = ({ initialTargetId }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    
    const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize AI history once the current user is loaded
    useEffect(() => {
        if (currentUser && aiHistory.length === 0) {
            setAiHistory([
                {
                    id: Date.now(),
                    senderId: LYNX_AI_USER.id,
                    receiverId: currentUser.id,
                    text: "Hello! I'm Lynx AI. How can I help you today?",
                    timestamp: new Date(),
                    sender: LYNX_AI_USER,
                    receiver: currentUser
                }
            ]);
        }
    }, [currentUser, aiHistory.length]);

    // Fetch directory users and prepend Lynx AI
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
        if (selectedUser?.id !== user.id) {
            setSelectedUser(user);
        }
    };

    // Handle initial user selection from props
    useEffect(() => {
        if (initialTargetId !== undefined && initialTargetId !== null && users.length > 0) {
            const target = users.find(u => u.id === initialTargetId);
            if (target) {
                handleSelectUser(target);
            }
        }
    }, [initialTargetId, users]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(scrollToBottom, [messages, isAiThinking]);

    // Handle user selection (switch between AI and P2P)
    useEffect(() => {
        if (!currentUser || !selectedUser) return;

        if (selectedUser.id === LYNX_AI_USER.id) {
            if (aiHistory.length > 0) {
                setMessages(aiHistory);
            }
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
            const incomingMsg: ChatMessage = {
                id: payload.id,
                senderId: payload.sender_id,
                receiverId: payload.receiver_id,
                text: payload.text,
                timestamp: new Date(payload.timestamp),
                sender: payload.sender_id === currentUser.id ? currentUser : selectedUser,
                receiver: payload.sender_id === currentUser.id ? selectedUser : currentUser,
            };
            setMessages(prev => [...prev, incomingMsg]);
        };

        chatService.subscribe(chatId, handleNewMessage);

        return () => {
            isMounted = false;
            chatService.unsubscribe(chatId);
        };
    }, [currentUser, selectedUser, aiHistory]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedUser) return;

        const textToSend = newMessage.trim();
        setNewMessage(''); // Clear input immediately

        if (selectedUser.id === LYNX_AI_USER.id) {
            // --- Handle AI Chat ---
            const userMsg: ChatMessage = {
                id: Date.now(),
                senderId: currentUser.id,
                receiverId: LYNX_AI_USER.id,
                text: textToSend,
                timestamp: new Date(),
                sender: currentUser,
                receiver: LYNX_AI_USER
            };
            
            const updatedHistory = [...aiHistory, userMsg];
            setAiHistory(updatedHistory);
            setMessages(updatedHistory);
            setIsAiThinking(true);

            try {
                const responseText = await geminiService.getChatAIResponse(textToSend);
                const aiMsg: ChatMessage = {
                    id: Date.now() + 1,
                    senderId: LYNX_AI_USER.id,
                    receiverId: currentUser.id,
                    text: responseText,
                    timestamp: new Date(),
                    sender: LYNX_AI_USER,
                    receiver: currentUser
                };
                setAiHistory(prev => [...prev, aiMsg]);
                setMessages(prev => [...prev, aiMsg]);
            } catch (error) {
                 const errorMsg: ChatMessage = {
                    id: Date.now() + 1,
                    senderId: LYNX_AI_USER.id,
                    receiverId: currentUser.id,
                    text: "I'm having trouble connecting right now. Please try again later.",
                    timestamp: new Date(),
                    sender: LYNX_AI_USER,
                    receiver: currentUser
                };
                setAiHistory(prev => [...prev, errorMsg]);
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsAiThinking(false);
            }

        } else {
            // --- Handle P2P Chat ---
            const messageData = {
                senderId: currentUser.id,
                receiverId: selectedUser.id,
                text: textToSend,
            };
            const optimisticMsg: ChatMessage = {
                id: Date.now(),
                ...messageData,
                timestamp: new Date(),
                sender: currentUser,
                receiver: selectedUser,
            };
            setMessages(prev => [...prev, optimisticMsg]);
            await chatService.sendMessage(messageData);
        }
    };

    return (
        <div className="w-full h-full flex text-white bg-gradient-to-br from-teal-700 to-green-800">
            {/* Sidebar with User List */}
            <aside className="w-1/3 bg-black/20 flex flex-col border-r border-white/10">
                <header className="p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold tracking-wide">Chats</h2>
                </header>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <nav className="p-2">
                        <ul className="space-y-1">
                            {users.map(user => {
                                const isAI = user.id === LYNX_AI_USER.id;
                                return (
                                    <li key={user.id}>
                                        <button
                                            onClick={() => handleSelectUser(user)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${
                                                selectedUser?.id === user.id 
                                                    ? 'bg-white/20 shadow-inner font-semibold' 
                                                    : 'hover:bg-white/10'
                                            }`}
                                        >   
                                            {isAI ? (
                                                <span className="flex items-center text-cyan-300">
                                                   <LynixLogo />
                                                   {user.username}
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    {user.username}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="w-2/3 bg-black/10 flex flex-col">
                {selectedUser ? (
                    <>
                        <header className="p-4 bg-white/5 flex-shrink-0 border-b border-white/10 flex items-center">
                             {selectedUser.id === LYNX_AI_USER.id ? (
                                 <div className="flex items-center text-cyan-300">
                                     <LynixLogo />
                                     <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                                 </div>
                             ) : (
                                 <div className="flex items-center">
                                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                                        {selectedUser.username.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                                 </div>
                             )}
                        </header>

                        <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            ) : messages.length > 0 ? (
                                <>
                                    {messages.map(msg => {
                                        const isMe = msg.senderId === currentUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                                <div className={`max-w-[80%] lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                                                    isMe 
                                                        ? 'bg-blue-600/90 text-white rounded-br-none' 
                                                        : 'bg-slate-700/80 text-white rounded-bl-none'
                                                }`}>
                                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isAiThinking && (
                                         <div className="flex justify-start animate-fade-in">
                                            <div className="px-5 py-4 rounded-2xl bg-slate-700/80 rounded-bl-none flex space-x-2 items-center">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-teal-100/70 space-y-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <p className="text-lg">No messages yet. Start the conversation!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 flex-shrink-0 border-t border-white/10">
                            <div className="flex items-center relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message ${selectedUser.username}...`}
                                    className="flex-grow bg-black/20 border border-white/10 text-white placeholder-white/50 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-black/30 transition-all"
                                    disabled={isAiThinking}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || isAiThinking}
                                    className="absolute right-1.5 top-1.5 w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 rounded-full text-white transition-colors"
                                >
                                    <SendIcon />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-teal-100/80 p-8">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Welcome to Chat</h2>
                        <p className="text-lg max-w-md">Select a contact from the sidebar to start messaging, or ask Lynx AI for assistance.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatApp;