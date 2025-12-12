
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

const MobileLoginSetup: React.FC = () => {
    const { login } = useAuth();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-advance from loading screen
    useEffect(() => {
        if (step === 1) {
            const timer = setTimeout(() => setStep(2), 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const { error } = await login(email, password);
        if (error) {
            setError(error);
            setIsLoading(false);
        }
    };

    // Screen 1: Welcome
    if (step === 0) {
        return (
            <div className="fixed inset-0 z-[40] flex flex-col items-center justify-center bg-gradient-to-b from-cyan-400 to-blue-600 text-white p-8 text-center animate-fade-in">
                <h1 className="text-5xl font-bold mb-4 leading-tight">Welcome!</h1>
                <p className="text-xl font-medium opacity-90">Let's get you setup!</p>
                <div className="flex-grow"></div>
                <button 
                    onClick={() => setStep(1)}
                    className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/30 transition-all active:scale-95 mb-10"
                >
                    <ArrowRight />
                </button>
            </div>
        );
    }

    // Screen 2: Loading Login
    if (step === 1) {
        return (
            <div className="fixed inset-0 z-[40] flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-pink-600 to-purple-700 text-white p-8 animate-fade-in">
                <h1 className="text-4xl font-bold tracking-wider animate-pulse">Loading Login...</h1>
            </div>
        );
    }

    // Screen 3: Login Form
    return (
        <div className="fixed inset-0 z-[40] flex flex-col items-center bg-gradient-to-br from-green-400 to-blue-600 p-8 animate-fade-in overflow-y-auto">
            <div className="mt-10 mb-6">
                <UserIcon />
            </div>
            
            <h1 className="text-3xl font-bold text-black mb-2 text-center">Use your Lynix ID!</h1>
            
            <p className="text-xs text-black/80 text-center mb-8 max-w-xs leading-relaxed">
                To use your Lynix For Mobile Device, You need a paid Lynix Online ID! Please enter your ID to continue. If you don't have one, buy an online subscription via <span className="underline font-bold">https://lynix.short.gy/shop</span>
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                <div>
                    <input 
                        type="text" 
                        placeholder="USERNAME" 
                        className="w-full bg-green-500/50 border-2 border-black placeholder-black/60 text-black font-bold py-3 px-4 focus:outline-none focus:bg-green-500/70 transition-colors uppercase"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        placeholder="PASSWORD" 
                        className="w-full bg-green-500/50 border-2 border-black placeholder-black/60 text-black font-bold py-3 px-4 focus:outline-none focus:bg-green-500/70 transition-colors uppercase"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                {error && <div className="bg-red-500/80 p-2 text-white text-xs text-center font-bold border border-red-700">{error}</div>}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-black text-white font-bold py-4 text-xl hover:bg-gray-900 transition-colors active:scale-95 disabled:opacity-50 mt-4"
                >
                    {isLoading ? 'VERIFYING...' : 'LOGIN'}
                </button>
            </form>
        </div>
    );
};

export default MobileLoginSetup;
