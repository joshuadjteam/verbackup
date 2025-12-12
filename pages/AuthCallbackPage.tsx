
import React, { useEffect, useState, useRef } from 'react';
import { database } from '../services/database';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

interface AuthCallbackPageProps {
    navigate: (page: Page, params?: any) => void;
}

const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ navigate }) => {
    const { login } = useAuth();
    const [step, setStep] = useState<'consent' | 'credentials' | 'processing' | 'logging_in' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Verifying authentication request...');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const authCodeRef = useRef<string | null>(null);

    // 1. On mount, extract the code and clean the URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        // Clean the URL immediately
        window.history.replaceState({}, document.title, '/');

        if (code && state?.startsWith('app-files')) {
            authCodeRef.current = code;
            setStep('consent');
        } else {
            setStep('error');
            setMessage('Invalid authentication request. No authorization code found.');
        }
    }, []);

    const handleLinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authCodeRef.current) {
            setStep('error');
            setMessage('Authentication session expired. Please try again.');
            return;
        }

        setStep('processing');
        setMessage('Securely linking your account...');

        try {
            const { success, error: linkError } = await database.loginAndLinkDrive(
                email,
                password,
                authCodeRef.current
            );

            if (!success) {
                setStep('error');
                setMessage(linkError || 'Failed to link Google Drive. The credentials might be incorrect.');
                return;
            }

            setStep('logging_in');
            setMessage('Account linked! Logging you in...');
            const { error: loginError } = await login(email, password);

            if (loginError) {
                setStep('error');
                setMessage('Account was linked, but client-side login failed. Please try logging in manually.');
                return;
            }
            
            setStep('success');
            setMessage('All set! Redirecting you to your files...');
            setTimeout(() => navigate('app-files'), 1500);

        } catch (err: any) {
            setStep('error');
            setMessage(err.message || 'An unexpected error occurred while linking your account.');
            console.error(err);
        }
    };
    
    if (step === 'error') {
        return (
            <div className="w-full max-w-md bg-teal-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-10 text-white flex flex-col items-center justify-center text-center border border-teal-700">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6">
                    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-red-400 mb-3">An Error Occurred</h1>
                <p className="mb-8 text-gray-200">{message}</p>
                <button 
                    onClick={() => navigate('signin')} 
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                    Back to Sign In
                </button>
            </div>
        );
    }
    
    if (step === 'consent') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white text-center animate-fade-in">
                <h1 className="text-6xl font-serif mb-12" style={{ fontFamily: 'Georgia, serif' }}>Google Integration</h1>
                <div className="max-w-3xl bg-green-500/30 backdrop-blur-sm rounded-3xl p-8 mb-16 border border-white/20">
                    <p className="text-lg leading-relaxed">
                        You are currently linking your Google © account to your LynixWeb/Lynix ID. By doing so you agree to our <a href="https://djteams.ca/termsofservice" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">Terms of Service</a>. Please note as you linking your Google Account is NOT a risk. As LynixWeb is still in progress, there is a chance we have to switch to another DB (Database) and/or web service. You may have to relink your Google account to your LynxWeb ID to continue using our service.
                    </p>
                </div>
                <div className="flex justify-between w-full max-w-3xl">
                    <button
                        onClick={() => navigate('app-files')}
                        className="px-8 py-3 bg-gray-500/50 hover:bg-gray-500/70 backdrop-blur-sm rounded-2xl text-lg font-semibold transition-colors border border-white/20"
                    >
                        Not agree
                    </button>
                    <button
                        onClick={() => setStep('credentials')}
                        className="px-8 py-3 bg-gray-300/80 hover:bg-gray-200/90 text-black backdrop-blur-sm rounded-2xl text-lg font-semibold transition-colors border border-white/20"
                    >
                        Accept and Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg bg-light-card/80 dark:bg-teal-800 backdrop-blur-sm border border-gray-300 dark:border-teal-700/50 rounded-2xl shadow-2xl p-12 text-light-text dark:text-white flex flex-col items-center justify-center text-center">
            {step === 'credentials' && (
                <>
                    <h1 className="text-3xl font-bold mb-4">Complete Link</h1>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">Enter your Lynix credentials to securely link your Google account.</p>
                    <form onSubmit={handleLinkAccount} className="w-full space-y-4">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-lg"
                        >
                            <LinkIcon />
                            <span>Link Account & Sign In</span>
                        </button>
                    </form>
                </>
            )}

            {(step === 'processing' || step === 'logging_in') && (
                <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
                    <h1 className="text-2xl font-semibold">{message}</h1>
                </>
            )}

            {step === 'success' && (
                <>
                    <svg className="h-24 w-24 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold mb-4">Success!</h1>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">Your account has been linked and you are now logged in.</p>
                    <button onClick={() => navigate('app-files')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                        Go to My Files
                    </button>
                </>
            )}
        </div>
    );
};

export default AuthCallbackPage;
