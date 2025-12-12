
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import AppContainer from '../components/AppContainer';
import { database } from '../services/database';
import { supabase } from '../supabaseClient';

const GuestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SignInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const GoogleIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64,15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,5 12,5C14.6,5 16.1,6.2 17.1,7.2L19,5.2C17.2,3.4 14.8,2 12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,11.63 21.95,11.36 21.89,11.1H21.35Z" fill="currentColor"/></svg>;
const IDIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

interface SignInPageProps {
    navigate: (page: Page) => void;
    hideGuest?: boolean;
}

type LoginMethod = 'sso' | 'phone' | 'google' | 'lynix_id';

const SignInPage: React.FC<SignInPageProps> = ({ navigate, hideGuest }) => {
    const { login, loginAsGuest, isLoggedIn, isLoading: isAuthLoading } = useAuth();
    const [method, setMethod] = useState<LoginMethod>('sso');
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [phoneCode, setPhoneCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    const [lynixId, setLynixId] = useState('');
    
    // UI Logic States
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resolvedEmail, setResolvedEmail] = useState<string | null>(null); // For Phone/ID flows

    useEffect(() => {
        if (isLoggedIn) navigate('home');
    }, [isLoggedIn, navigate]);

    // Cleanup state when switching methods
    useEffect(() => {
        setError('');
        setResolvedEmail(null);
        setPassword('');
    }, [method]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        // Standard Supabase OAuth
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) setError(error.message);
        // Redirect happens automatically if successful
        setIsLoading(false);
    };

    const handleIdentifierLookup = async (type: 'phone' | 'lynix_id') => {
        setIsLoading(true);
        setError('');
        
        let value = '';
        if (type === 'phone') {
            value = `${phoneCode}${phoneNumber.replace(/\D/g, '')}`; // Format: +15551234567
        } else {
            value = lynixId.replace(/-/g, ''); // Strip dashes for API check
        }

        try {
            const { email: foundEmail, error: lookupError } = await database.resolveUserIdentifier(type, value);
            
            if (lookupError || !foundEmail) {
                setError(lookupError || 'Identity not found. Please check your input.');
                setIsLoading(false);
                return;
            }
            
            setResolvedEmail(foundEmail);
            setError('');
        } catch (e) {
            setError('Connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const targetEmail = resolvedEmail || email;

        if (!targetEmail || !password) {
            setError('Credentials missing.');
            setIsLoading(false);
            return;
        }

        const { error: loginError } = await login(targetEmail, password);
        
        if (loginError) {
            setError(loginError);
        }
        // If success, useAuth hook handles redirection
        setIsLoading(false);
    };

    const handleTryOut = async () => {
        setError('');
        await loginAsGuest();
    };
    
    // Auto-format Lynix ID with dashes
    const handleLynixIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 10) val = val.slice(0, 10);
        // Format: 047-1234-567
        if (val.length > 7) {
            val = val.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
        } else if (val.length > 3) {
            val = val.replace(/(\d{3})(\d+)/, '$1-$2');
        }
        setLynixId(val);
    };
    
    const isSubmitting = isLoading || isAuthLoading;

    // Render Tab Button Helper
    const MethodTab = ({ id, label, icon }: { id: LoginMethod, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setMethod(id)}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-300 border-b-2 flex flex-col items-center justify-center gap-1 ${
                method === id 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
            <div className={`transition-transform duration-300 ${method === id ? 'scale-110' : 'scale-100'}`}>
                {icon}
            </div>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <AppContainer className="w-full max-w-md p-0 text-light-text dark:text-white flex flex-col items-center overflow-hidden shadow-2xl border-t-4 border-t-blue-500">
            <div className="w-full bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex">
                <MethodTab id="sso" label="SSO" icon={<MailIcon />} />
                <MethodTab id="phone" label="Phone" icon={<PhoneIcon />} />
                <MethodTab id="google" label="Google" icon={<GoogleIcon />} />
                <MethodTab id="lynix_id" label="LynixID" icon={<IDIcon />} />
            </div>

            <div className="w-full p-8 animate-fade-in min-h-[380px] flex flex-col justify-center relative">
                
                {/* 10101010 Feature Badge */}
                <div className="absolute top-4 right-4">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 shadow-sm">
                        <ShieldIcon />
                        10101010 Secure
                    </span>
                </div>

                <div className="text-center mb-8 mt-2">
                    <h1 className="text-2xl font-bold">
                        {method === 'sso' && 'Standard Sign In'}
                        {method === 'phone' && 'Phone Login'}
                        {method === 'google' && 'Google Account'}
                        {method === 'lynix_id' && 'LynixMobile ID'}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Secure Authentication</p>
                </div>

                {/* --- Method 1: SSO (Email/Pass) --- */}
                {method === 'sso' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value.trim())}
                            className="w-full bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={isSubmitting}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={isSubmitting}
                            required
                        />
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg">
                            {isSubmitting ? 'Verifying...' : <><SignInIcon /><span>Sign In</span></>}
                        </button>
                    </form>
                )}

                {/* --- Method 2: Phone Login --- */}
                {method === 'phone' && (
                    <div className="space-y-4">
                        {!resolvedEmail ? (
                            <>
                                <div className="flex gap-2">
                                    <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-2 py-3 focus:outline-none cursor-pointer">
                                        <option value="+1">+1 (US/CA)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+33">+33 (FR)</option>
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+61">+61 (AU)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button onClick={() => handleIdentifierLookup('phone')} disabled={isSubmitting || !phoneNumber} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
                                    {isSubmitting ? 'Looking up...' : 'Continue'}
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded text-center text-sm mb-2 border border-blue-200 dark:border-blue-800">
                                    <span className="block text-xs text-blue-500 uppercase font-bold mb-1">Account Found</span>
                                    {resolvedEmail}
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
                                    {isSubmitting ? 'Logging In...' : 'Confirm Login'}
                                </button>
                                <button type="button" onClick={() => { setResolvedEmail(null); setPassword(''); }} className="w-full text-gray-500 text-sm hover:underline">Use different number</button>
                            </form>
                        )}
                    </div>
                )}

                {/* --- Method 3: Google Login --- */}
                {method === 'google' && (
                    <div className="flex flex-col items-center space-y-6">
                        <p className="text-center text-gray-600 dark:text-gray-300">
                            Use your Google Account to sign in securely.
                        </p>
                        <button 
                            onClick={handleGoogleLogin} 
                            disabled={isSubmitting}
                            className="w-full bg-white dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-all active:scale-95 shadow-md flex items-center justify-center space-x-3 border border-gray-300 dark:border-slate-500"
                        >
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>
                    </div>
                )}

                {/* --- Method 4: LynixMobile ID --- */}
                {method === 'lynix_id' && (
                    <div className="space-y-4">
                        {!resolvedEmail ? (
                            <>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Enter your 10-digit Lynix Mobile ID</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="047-XXXX-XXX"
                                        value={lynixId}
                                        onChange={handleLynixIdChange}
                                        className="w-full bg-gray-100 dark:bg-slate-700 border-2 border-purple-300 dark:border-purple-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 tracking-widest font-mono text-center text-xl"
                                        maxLength={12} // 10 digits + 2 dashes
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button onClick={() => handleIdentifierLookup('lynix_id')} disabled={isSubmitting || lynixId.length < 10} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
                                    {isSubmitting ? 'Verifying ID...' : 'Verify ID'}
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-center text-sm mb-2 border border-purple-200 dark:border-purple-800">
                                    <span className="block text-xs text-purple-500 uppercase font-bold mb-1">ID Verified</span>
                                    {resolvedEmail}
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    required
                                />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
                                    {isSubmitting ? 'Authenticating...' : 'Secure Login'}
                                </button>
                                <button type="button" onClick={() => { setResolvedEmail(null); setPassword(''); }} className="w-full text-gray-500 text-sm hover:underline">Change ID</button>
                            </form>
                        )}
                    </div>
                )}

                {error && <p className="mt-4 text-red-600 dark:text-red-400 text-sm text-center bg-red-100 dark:bg-red-900/20 p-3 rounded-md animate-fade-in border border-red-200 dark:border-red-800">{error}</p>}

                {!hideGuest && method === 'sso' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 w-full">
                        <button
                            type="button"
                            onClick={handleTryOut}
                            disabled={isSubmitting}
                            className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <GuestIcon />
                            <span>Try as Guest?</span>
                        </button>
                    </div>
                )}
            </div>
        </AppContainer>
    );
};

export default SignInPage;
