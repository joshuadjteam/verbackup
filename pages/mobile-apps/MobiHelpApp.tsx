
import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../../types';
import { geminiService } from '../../services/geminiService';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const ChatBubble = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

interface MobiHelpAppProps {
    navigate: (page: Page) => void;
}

const MobiHelpApp: React.FC<MobiHelpAppProps> = ({ navigate }) => {
    const [view, setView] = useState<'home' | 'chat'>('home');
    const [messages, setMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
        { sender: 'ai', text: "Hi there! I'm the Lynix Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (view === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);

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
            setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const faqs = [
        { q: "Blocked Websites?", a: "Some sites (Netflix, Twitter) block our browser. Use 'Open External' for these." },
        { q: "How to Sign In?", a: "Use your credentials on the start screen. Guest mode is disabled on mobile." },
        { q: "Forgot Password?", a: "Please contact admin@lynixity.x10.bz to reset." }
    ];

    if (view === 'chat') {
        return (
            <div className="w-full h-full flex flex-col bg-[#f2f2f2] dark:bg-[#121212] text-black dark:text-white font-sans">
                <header className="flex-shrink-0 p-4 flex items-center space-x-4 bg-white dark:bg-[#1e1e1e] shadow-sm z-10">
                    <button onClick={() => setView('home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>
                    </button>
                    <h1 className="text-xl font-normal">Lynix Support</h1>
                </header>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                                msg.sender === 'user' 
                                    ? 'bg-[#0b57cf] text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-[#303030] text-black dark:text-white rounded-bl-sm shadow-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-white dark:bg-[#303030] px-4 py-3 rounded-3xl rounded-bl-sm shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div></div>}
                    <div ref={bottomRef} />
                </div>
                <div className="p-4 bg-white dark:bg-[#1e1e1e] flex items-center space-x-3">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Message..." 
                        className="flex-grow bg-[#f2f2f2] dark:bg-[#303030] rounded-full px-5 py-3 focus:outline-none text-black dark:text-white"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="p-3 bg-[#0b57cf] text-white rounded-full disabled:opacity-50">
                        <SendIcon />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#f0f4f8] dark:bg-[#121212] text-black dark:text-white font-sans">
            <div className="p-6 pt-12 pb-8 bg-[#c2e7ff] dark:bg-[#004a77] rounded-b-[3rem] shadow-sm">
                <h1 className="text-3xl font-normal mb-2 text-[#001d35] dark:text-[#c2e7ff]">How can we help?</h1>
                <div className="relative mt-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search help..." 
                        className="w-full bg-white/90 dark:bg-black/30 backdrop-blur-md rounded-full py-3 pl-12 pr-4 text-[#001d35] dark:text-white placeholder-[#001d35]/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#001d35] dark:focus:ring-[#c2e7ff]"
                        onKeyDown={(e) => { if (e.key === 'Enter') setView('chat'); }}
                    />
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setView('chat')} className="bg-white dark:bg-[#303030] p-5 rounded-3xl shadow-sm flex flex-col items-start space-y-3 hover:bg-gray-50 dark:hover:bg-[#383838] transition-colors">
                        <div className="p-3 bg-[#d3e3fd] dark:bg-[#004a77] rounded-full text-[#041e49] dark:text-[#c2e7ff]"><ChatBubble className="h-6 w-6" /></div>
                        <span className="font-medium">Chat with AI</span>
                    </button>
                    <button onClick={() => window.location.href = 'mailto:admin@lynixity.x10.bz'} className="bg-white dark:bg-[#303030] p-5 rounded-3xl shadow-sm flex flex-col items-start space-y-3 hover:bg-gray-50 dark:hover:bg-[#383838] transition-colors">
                        <div className="p-3 bg-[#c4eed0] dark:bg-[#0f5223] rounded-full text-[#072711] dark:text-[#c4eed0]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="font-medium">Email Us</span>
                    </button>
                </div>

                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Common Questions</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <details key={i} className="group bg-white dark:bg-[#303030] rounded-2xl overflow-hidden shadow-sm">
                            <summary className="p-4 font-medium cursor-pointer list-none flex justify-between items-center">
                                {faq.q}
                                <span className="transition-transform group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </span>
                            </summary>
                            <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobiHelpApp;
