
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface MobileOnboardingProps {
    onComplete: () => void;
}

const MobileOnboarding: React.FC<MobileOnboardingProps> = ({ onComplete }) => {
    const { logout } = useAuth();
    const [step, setStep] = useState(0);

    const handleDecline = () => {
        if (confirm("If you do not agree, you cannot use Lynix. Sign out?")) {
            logout();
        }
    };

    // Step 0: Terms of Service
    if (step === 0) {
        return (
            <div className="fixed inset-0 z-[50000] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 flex flex-col p-6 animate-fade-in text-white overflow-y-auto">
                <div className="mt-10 mb-6">
                    <h1 className="text-5xl font-bold mb-2">Welcome User!</h1>
                </div>

                <div className="bg-orange-500/90 text-black p-6 mb-8 shadow-xl border-4 border-yellow-300 rotate-1">
                    <h2 className="text-2xl font-black mb-4 uppercase underline decoration-4 decoration-black">You Must agree out to ToS</h2>
                    <p className="font-bold text-sm leading-relaxed">
                        The Lynix for Mobile Web3 Service is a service that allows users to use Lynix and Google Integration!
                        <br/><br/>
                        Users are <span className="underline">NOT</span> allowed to share their identity.
                        <br/><br/>
                        Therefore if shared. Users will either be terminated, or face suspension.
                    </p>
                    <div className="mt-4 pt-4 border-t border-black/20 text-xs font-bold space-y-1">
                        <p>By continuing, you agree to our:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><a href="https://djteams.ca/termsofservice" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="https://djteams.ca/apppripollnk" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-auto space-y-4 mb-8">
                    <button 
                        onClick={handleDecline}
                        className="w-full bg-red-600 border-4 border-red-800 text-white font-bold py-4 rounded-none hover:bg-red-700 active:bg-red-800 transition-colors text-lg shadow-lg"
                    >
                        I DO NOT agree
                    </button>
                    <button 
                        onClick={() => setStep(1)}
                        className="w-full bg-green-500 border-4 border-green-700 text-black font-black py-4 rounded-none hover:bg-green-400 active:bg-green-600 transition-colors text-lg shadow-lg transform scale-105"
                    >
                        I agree to the Terms and Service
                    </button>
                </div>
            </div>
        );
    }

    // Step 1: All Set
    return (
        <div className="fixed inset-0 z-[50000] bg-gradient-to-b from-teal-400 to-blue-700 flex flex-col items-center justify-center p-8 animate-fade-in text-white">
            <h1 className="text-6xl font-black text-center mb-12 drop-shadow-lg text-black tracking-tighter">Your All Set!</h1>
            
            <button 
                onClick={onComplete}
                className="bg-blue-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-2xl border-4 border-white/50 hover:scale-105 active:scale-95 transition-all"
            >
                Let's Go!
            </button>
        </div>
    );
};

export default MobileOnboarding;
