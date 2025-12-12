
import React, { useState } from 'react';
import { useCall } from '../../hooks/useCall';
import VoiceAssistantWidget from '../../components/VoiceAssistantWidget';
import { database } from '../../services/database';
import { Page } from '../../types';

// Icons
const BackSpaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;

interface MobiPhoneAppProps {
    navigate?: (page: Page) => void;
    onReboot?: () => void;
}

const MobiPhoneApp: React.FC<MobiPhoneAppProps> = ({ onReboot }) => {
    const [input, setInput] = useState('');
    const { startP2PCall } = useCall();
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

    const handleNumberClick = (num: string) => {
        setInput(prev => prev + num);
    };

    const handleBackspace = () => {
        setInput(prev => prev.slice(0, -1));
    };

    const resolveTarget = async (rawInput: string): Promise<{ username: string, original: string } | null> => {
        const trimmed = rawInput.trim();
        // Check if it's a 10-digit number starting with 2901
        if (/^2901\d{6}$/.test(trimmed)) {
            const { active, username, error } = await database.checkPhoneNumberStatus(trimmed);
            if (!active || error) {
                alert(error || 'The party is unavailable.');
                return null;
            }
            if (username) return { username, original: trimmed };
        }
        return { username: trimmed, original: trimmed };
    };

    const handleCall = async () => {
        if (input === '') {
            // Special empty check for Developer Mode unlock
            const devSteps = localStorage.getItem('lynix_dev_steps_complete');
            if (devSteps === 'true') {
                localStorage.setItem('lynix_developer_mode', 'true');
                alert("Developer Mode Enabled! The Modder App is now available in your drawer.");
                localStorage.removeItem('lynix_dev_steps_complete'); // Clear step
                
                if (onReboot) {
                    onReboot();
                } else {
                    window.location.reload(); // Reload to refresh app list if on real device
                }
                return;
            }
        }

        if (!input.trim()) return;
        const result = await resolveTarget(input);
        if (result) startP2PCall(result.username, false, result.original);
    };

    const handleVideoCall = async () => {
        if (!input.trim()) return;
        const result = await resolveTarget(input);
        if (result) startP2PCall(result.username, true, result.original);
    };

    const KeypadButton = ({ num, sub }: { num: string, sub?: string }) => (
        <button 
            onClick={() => handleNumberClick(num)}
            className="w-20 h-20 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex flex-col items-center justify-center transition-colors active:bg-gray-200 dark:active:bg-white/20"
        >
            <span className="text-3xl font-normal text-black dark:text-white">{num}</span>
            {sub && <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest">{sub}</span>}
        </button>
    );

    return (
        <>
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
                <div className="flex-grow flex flex-col justify-end items-center pb-8">
                    <input 
                        type="text" 
                        readOnly 
                        value={input} 
                        className="text-4xl text-center bg-transparent border-none focus:outline-none mb-4 w-full px-8 text-black dark:text-white" 
                        placeholder="Type a name or number"
                    />
                    {input && (
                        <div className="flex space-x-4 text-blue-600 dark:text-blue-300 text-sm font-medium cursor-pointer">
                            <span onClick={() => setIsVoiceAssistantOpen(true)}>Voice Assistant</span>
                            <span onClick={() => setInput('')}>Clear</span>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <div className="grid grid-cols-3 gap-y-4 justify-items-center mb-6">
                        <KeypadButton num="1" />
                        <KeypadButton num="2" sub="ABC" />
                        <KeypadButton num="3" sub="DEF" />
                        <KeypadButton num="4" sub="GHI" />
                        <KeypadButton num="5" sub="JKL" />
                        <KeypadButton num="6" sub="MNO" />
                        <KeypadButton num="7" sub="PQRS" />
                        <KeypadButton num="8" sub="TUV" />
                        <KeypadButton num="9" sub="WXYZ" />
                        <KeypadButton num="*" />
                        <KeypadButton num="0" sub="+" />
                        <KeypadButton num="#" />
                    </div>

                    <div className="flex justify-center items-center space-x-8">
                        {input && (
                            <button onClick={handleVideoCall} className="p-4 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                                <VideoIcon />
                            </button>
                        )}
                        
                        <button 
                            onClick={handleCall}
                            className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                        >
                            <PhoneIcon />
                        </button>

                        {input && (
                            <button onClick={handleBackspace} className="p-4 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                                <BackSpaceIcon />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <VoiceAssistantWidget isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} />
        </>
    );
};

export default MobiPhoneApp;
