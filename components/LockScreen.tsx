
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme, wallpapers } from '../hooks/useTheme';

interface LockScreenProps {
    isLocked: boolean;
    onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock }) => {
    const { user } = useAuth();
    const { wallpaper } = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [hasPin, setHasPin] = useState(false);
    const [time, setTime] = useState(new Date());
    const [touchStart, setTouchStart] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            const storedPin = localStorage.getItem(`lynix_pin_${user.id}`);
            setHasPin(!!storedPin);
        }
    }, [user, isLocked]);

    useEffect(() => {
        if (!isLocked) {
            setPin('');
            setError('');
        }
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [isLocked]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                verifyPin(newPin);
            }
        }
    };

    const verifyPin = (inputPin: string) => {
        if (!user) return;
        const storedPin = localStorage.getItem(`lynix_pin_${user.id}`);
        
        if (storedPin === inputPin) {
            onUnlock();
        } else {
            setError('Incorrect PIN');
            setTimeout(() => {
                setPin('');
                setError('');
            }, 1000);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientY;
        // Swipe up threshold
        if (touchStart - touchEnd > 50) {
            if (!hasPin) {
                onUnlock();
            }
        }
        setTouchStart(null);
    };

    if (!isLocked) return null;

    const wallpaperClass = wallpapers[wallpaper]?.class || 'bg-black';

    return (
        <div 
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-between pb-10 text-white font-sans animate-fade-in overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Wallpaper Background with Blur/Dim */}
            <div className={`absolute inset-0 ${wallpaperClass} bg-cover bg-center`}></div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <div className="mt-20 flex flex-col items-center z-10">
                <div className="text-7xl font-light tracking-tight mb-2 drop-shadow-md">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-lg font-medium text-white/80 drop-shadow-sm">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {!hasPin ? (
                <div className="flex flex-col items-center mb-20 animate-bounce z-10">
                    <p className="mb-4 text-white/70 text-sm font-medium">Swipe up to unlock</p>
                    <button 
                        onClick={onUnlock}
                        className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="w-full px-8 z-10">
                    <div className="flex justify-center space-x-4 mb-8">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-4 h-4 rounded-full border-2 border-white transition-colors ${i < pin.length ? 'bg-white' : 'bg-transparent'}`}></div>
                        ))}
                    </div>
                    {error && <p className="text-center text-red-300 font-bold mb-4 drop-shadow">{error}</p>}
                    
                    <div className="grid grid-cols-3 gap-y-6 gap-x-8 justify-items-center max-w-xs mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button 
                                key={num} 
                                onClick={() => handleNumberClick(num.toString())}
                                className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-3xl font-normal transition-colors backdrop-blur-sm"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="w-20"></div>
                        <button 
                            onClick={() => handleNumberClick('0')}
                            className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-3xl font-normal transition-colors backdrop-blur-sm"
                        >
                            0
                        </button>
                        <button 
                            onClick={handleBackspace}
                            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                        >
                            ⌫
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LockScreen;
