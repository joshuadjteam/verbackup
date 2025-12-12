
import React, { useState, useRef, useEffect } from 'react';
import AppContainer from '../components/AppContainer';
import { Page } from '../types';
import { geminiService } from '../services/geminiService';
import Clock from '../components/Clock';

const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const FaqIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

interface SupportPageProps {
    navigate: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
    const [activeTab, setActiveTab] = useState<'faq' | 'ai' | 'contact'>('faq');

    return (
        <AppContainer className="w-full max-w-4xl h-[80vh] flex flex-col text-light-text dark:text-white overflow-hidden">
            <div className="flex-shrink-0 p-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <h1 className="text-3xl font-bold mb-2">Support Center</h1>
                <p className="text-gray-500 dark:text-gray-400">Get help, find answers, or contact the team.</p>
            </div>
            
            <div className="flex flex-grow overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/4 bg-gray-100 dark:bg-black/20 p-4 space-y-2 border-r border-gray-200 dark:border-white/10">
                    <button 
                        onClick={() => setActiveTab('faq')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'faq' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                    >
                        <FaqIcon />
                        <span className="font-medium">FAQ & Info</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                    >
                        <ChatIcon />
                        <span className="font-medium">AI Assistant</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('contact')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'contact' ? 'bg-green-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                    >
                        <ContactIcon />
                        <span className="font-medium">Contact Us</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="w-3/4 p-8 overflow-y-auto">
                    {activeTab === 'faq' && <FaqContent />}
                    {activeTab === 'ai' && <AiAssistantContent />}
                    {activeTab === 'contact' && <ContactContent />}
                </div>
            </div>
        </AppContainer>
    );
};

const FaqContent = () => (
    <div className="space-y-8 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-500">Frequently Asked Questions</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Everything you need to know about using Lynix.</p>
        </div>

        <div className="space-y-4">
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg mb-2">Why are some websites blocked in the browser?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Due to security restrictions (X-Frame-Options and CORS) enforced by major websites to prevent "clickjacking," some sites cannot be loaded inside the Lynix virtual browser.
                    <br/><br/>
                    <strong>Commonly blocked sites include:</strong>
                    <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                        <li>Netflix, Disney+, Hulu (DRM protection)</li>
                        <li>WhatsApp Web, Telegram Web</li>
                        <li>Banking websites (Chase, Bank of America, etc.)</li>
                        <li>Some government portals</li>
                        <li>X (Twitter) and Instagram (varies)</li>
                    </ul>
                    <br/>
                    For these sites, please use the "Open External" button or your device's native browser.
                </p>
            </div>

            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg mb-2">How do I sign in?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    If you have an account, use the "Sign On" button on the home screen. If you don't have an account, you can use the <strong>"Try as Guest"</strong> feature to access a temporary sandbox environment. 
                    Permanent accounts are currently managed by administrators.
                </p>
            </div>

            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg mb-2">What devices are supported?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Lynix is a Progressive Web App (PWA). It runs on:
                    <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                        <li><strong>Desktop:</strong> Chrome, Edge, Firefox, Safari (macOS)</li>
                        <li><strong>Mobile:</strong> Android (Chrome), iOS (Safari)</li>
                        <li><strong>Tablets:</strong> iPadOS, Android Tablets</li>
                    </ul>
                </p>
            </div>
        </div>
    </div>
);

const AiAssistantContent = () => {
    const [messages, setMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
        { sender: 'ai', text: "Hello! I am the Lynix Support Bot. Ask me about features, errors, or account help." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.getHelpResponse(userMsg);
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to the server. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-purple-500">AI Assistant</h2>
            <div className="flex-grow bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-gray-500 text-xs ml-2">Thinking...</div>}
                <div ref={bottomRef} />
            </div>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..." 
                    className="flex-grow bg-gray-100 dark:bg-slate-700 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button onClick={handleSend} disabled={isLoading} className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50">
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

const ContactContent = () => (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold">Get in Touch</h2>
        <p className="max-w-md text-gray-600 dark:text-gray-300">
            We're here to help with any specific issues that the FAQ or AI couldn't resolve.
        </p>
        
        <div className="bg-white/50 dark:bg-black/20 p-8 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-md space-y-4">
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-gray-500 mb-1">Email Support</span>
                <a href="mailto:admin@lynixity.x10.bz" className="text-xl text-blue-500 hover:underline font-semibold">admin@lynixity.x10.bz</a>
            </div>
            
            <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-gray-500 mb-1">Phone Support</span>
                <a href="tel:+16472474844" className="text-xl text-blue-500 hover:underline font-semibold">+1 (647) 247 - 4844</a>
            </div>

            <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-gray-500 mb-1">TalkID</span>
                <span className="text-xl font-mono">0470055990</span>
            </div>
        </div>

        <div className="mt-8">
            <Clock />
        </div>
    </div>
);

export default SupportPage;
