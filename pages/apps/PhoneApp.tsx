
import React, { useState } from 'react';
import { useCall } from '../../hooks/useCall';
import VoiceAssistantWidget from '../../components/VoiceAssistantWidget';
import { database } from '../../services/database';

// Icons
const DialpadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const AssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const VideoCallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;

type PhoneView = 'dialer' | 'assistant';

// Extracted components to maintain focus stability
const DialerTab: React.FC<{ targetUser: string; setTargetUser: (s: string) => void; handleCall: (video: boolean) => void }> = ({ targetUser, setTargetUser, handleCall }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">P2P Call</h2>
        <p className="text-sm text-gray-400 mb-6">Enter a username or number (e.g. 2901xxxxxx) to start a call.</p>
        <input
            type="text"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            placeholder="Enter username or number"
            className="w-full max-w-xs bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-lg mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
        />
        <div className="flex space-x-4">
            <button onClick={() => handleCall(false)} className="w-32 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <DialpadIcon />
                <span>Audio</span>
            </button>
            <button onClick={() => handleCall(true)} className="w-32 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <VideoCallIcon />
                <span>Video</span>
            </button>
        </div>
    </div>
);

const AssistantTab: React.FC<{ openAssistant: () => void }> = ({ openAssistant }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">AI Voice Assistant</h2>
        <p className="text-sm text-gray-400 mb-6">Start a hands-free conversation with your AI assistant.</p>
        <button 
            onClick={openAssistant} 
            className="w-full max-w-xs bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 flex items-center justify-center space-x-2"
        >
            <AssistantIcon />
            <span>Launch Assistant</span>
        </button>
    </div>
);

const PhoneApp: React.FC = () => {
    const [view, setView] = useState<PhoneView>('dialer');
    const [targetUser, setTargetUser] = useState('');
    const { startP2PCall } = useCall();
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

    const handleCall = async (withVideo: boolean) => {
        if (targetUser.trim()) {
            let finalTarget = targetUser.trim();
            let extraInfo = undefined;
            
            // Check if it's a 10-digit number starting with 2901
            if (/^2901\d{6}$/.test(finalTarget)) {
                // Verify number via backend to get specific status codes (76A, 76B)
                const { active, username, error } = await database.checkPhoneNumberStatus(finalTarget);
                
                if (!active || error) {
                    alert(error || "User not available.");
                    return;
                }
                
                if (username) {
                    extraInfo = finalTarget; // Pass the number as extra info
                    finalTarget = username;
                }
            }
            
            startP2PCall(finalTarget, withVideo, extraInfo);
        }
    };

    return (
        <>
            <div className="w-full h-full flex flex-col p-6 bg-dark-bg text-light-text dark:text-white">
                <header className="flex-shrink-0 mb-6">
                    <div className="flex justify-center bg-black/20 p-1 rounded-lg">
                        <button onClick={() => setView('dialer')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${view === 'dialer' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Dialer</button>
                        <button onClick={() => setView('assistant')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${view === 'assistant' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Assistant</button>
                    </div>
                </header>
                <main className="flex-grow">
                    {view === 'dialer' ? (
                        <DialerTab targetUser={targetUser} setTargetUser={setTargetUser} handleCall={handleCall} />
                    ) : (
                        <AssistantTab openAssistant={() => setIsVoiceAssistantOpen(true)} />
                    )}
                </main>
            </div>
            <VoiceAssistantWidget isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} />
        </>
    );
};

export default PhoneApp;
