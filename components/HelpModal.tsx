

import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'auth' | 'chat'>('auth');
    const [userType, setUserType] = useState<'guest' | 'lynxid' | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleStart = (type: 'guest' | 'lynxid') => {
        setUserType(type);
        setStep('chat');
        setMessages([{ sender: 'ai', text: `Hello! How can I help you today? You are connected as ${type}.` }]);
    };
    
    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.getHelpResponse(input);
            const aiMessage: Message = { sender: 'ai', text: response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I couldn't connect to the help service." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-card dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col text-light-text dark:text-white">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Lynix Support</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>

                {step === 'auth' && (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                        <h3 className="text-2xl font-semibold mb-2">How would you like to connect?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Choose your identity to start a chat with our AI assistant.</p>
                        <div className="space-y-4 w-full max-w-xs">
                            <button onClick={() => handleStart('lynxid')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                Connect with LynxID
                                <p className="text-xs font-normal text-blue-200">Unlimited Responses</p>
                            </button>
                            <button onClick={() => handleStart('guest')} className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                Continue as Guest
                                <p className="text-xs font-normal text-slate-300">50 Responses/hr</p>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'chat' && (
                    <div className="flex-grow flex flex-col p-4 overflow-hidden">
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-200 dark:bg-slate-700 rounded-bl-none`}>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="mt-4 flex items-center border-t border-gray-200 dark:border-slate-700 pt-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="flex-grow bg-gray-200 dark:bg-slate-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="ml-3 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-slate-500 text-white font-semibold">
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpModal;