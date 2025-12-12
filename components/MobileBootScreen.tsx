
import React, { useState, useRef, useEffect } from 'react';

const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-50 hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

interface MobileBootScreenProps {
    onComplete?: () => void;
}

const MobileBootScreen: React.FC<MobileBootScreenProps> = ({ onComplete }) => {
    const [isPoweredOn, setIsPoweredOn] = useState(false);
    const [step, setStep] = useState(0);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const isStartingRef = useRef(false); // Guard against double taps

    const runBootSequence = (ctx: AudioContext | null) => {
        // Play Sound if context exists and is running
        if (ctx && ctx.state === 'running') {
            try {
                const t = ctx.currentTime;
                
                // Primary Tone (Rising)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(220, t); // A3
                osc1.frequency.exponentialRampToValueAtTime(880, t + 0.6); // A5
                gain1.gain.setValueAtTime(0, t);
                gain1.gain.linearRampToValueAtTime(0.3, t + 0.1);
                gain1.gain.exponentialRampToValueAtTime(0.01, t + 2.5);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(t);
                osc1.stop(t + 2.5);

                // Harmony Tone
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(329.63, t); // E4
                osc2.frequency.exponentialRampToValueAtTime(659.25, t + 0.8); // E5
                gain2.gain.setValueAtTime(0, t);
                gain2.gain.linearRampToValueAtTime(0.15, t + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.01, t + 3);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(t);
                osc2.stop(t + 3);

                // Bass Thrum
                const osc3 = ctx.createOscillator();
                const gain3 = ctx.createGain();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(110, t); // A2
                gain3.gain.setValueAtTime(0, t);
                gain3.gain.linearRampToValueAtTime(0.4, t + 0.1);
                gain3.gain.linearRampToValueAtTime(0, t + 1.5);
                osc3.connect(gain3);
                gain3.connect(ctx.destination);
                osc3.start(t);
                osc3.stop(t + 2);
            } catch (e) {
                console.error("Boot audio playback error:", e);
            }
        }

        // Sequence timings for L Y N I X + Square
        const timings = [
            200,  // L
            800,  // Y
            1400, // N
            2000, // I
            2600, // X
            3200, // Red Square
            5000  // Finish
        ];

        timings.forEach((time, index) => {
            setTimeout(() => {
                setStep(index + 1);
                if (index === timings.length - 1 && onComplete) {
                    onComplete();
                }
            }, time);
        });
    };

    const handlePowerOn = async () => {
        // Prevent double invocation
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        let ctx: AudioContext | null = null;

        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                ctx = new AudioContext();
                audioCtxRef.current = ctx;

                // Attempt to resume audio context with a safety timeout.
                // If browser blocks it or it takes too long, we proceed anyway to avoid black screen.
                const resumePromise = ctx.resume();
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));

                await Promise.race([resumePromise, timeoutPromise]);
            }
        } catch (e) {
            console.error("Audio Context Initialization Failed", e);
            // We swallow the error to ensure visuals still run
        } finally {
            // Always trigger the visual sequence
            setIsPoweredOn(true);
            // Pass the context (if it exists) to the sequence runner
            runBootSequence(ctx);
        }
    };

    if (!isPoweredOn) {
        return (
            <div className="absolute inset-0 bg-black z-[99999] flex items-center justify-center">
                <button 
                    onClick={handlePowerOn}
                    className="p-8 rounded-full border-4 border-white/20 hover:border-white/50 hover:bg-white/10 transition-all active:scale-95 group"
                >
                   <PowerIcon />
                   <span className="sr-only">Power On</span>
                </button>
                <p className="absolute bottom-10 text-white/30 text-xs font-mono">Tap to Power On</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black z-[99999] flex flex-col items-center justify-center overflow-hidden">
            <div className="relative flex items-center justify-center mb-10">
                {/* Letters L Y N I X */}
                <div className="flex items-baseline space-x-2 text-7xl font-bold select-none">
                    <span className={`transition-opacity duration-700 ${step >= 1 ? 'opacity-100 text-[#b91c1c]' : 'opacity-0'}`}>L</span>
                    <span className={`transition-opacity duration-700 ${step >= 2 ? 'opacity-100 text-[#3b82f6]' : 'opacity-0'}`}>Y</span>
                    <span className={`transition-opacity duration-700 ${step >= 3 ? 'opacity-100 text-[#9ca3af]' : 'opacity-0'}`}>N</span>
                    <span className={`transition-opacity duration-700 ${step >= 4 ? 'opacity-100 text-[#7f1d1d]' : 'opacity-0'}`}>I</span>
                    <span className={`transition-opacity duration-700 ${step >= 5 ? 'opacity-100 text-[#4b5563]' : 'opacity-0'}`}>X</span>
                    
                    {/* Red Square Block */}
                    <div className={`w-12 h-12 bg-[#991b1b] ml-4 self-center transition-opacity duration-700 ${step >= 6 ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
            </div>

            {/* Footer Text */}
            <div className={`absolute bottom-12 text-center transition-opacity duration-1000 ${step >= 6 ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-white/30 text-[10px] font-sans tracking-wide uppercase">
                    A powered by eCode Lynix Device - Made with React and Love!
                </p>
            </div>
        </div>
    );
};

export default MobileBootScreen;
