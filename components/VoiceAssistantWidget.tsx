import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/database';

const UnmuteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const MuteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const EndCallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01,16.46c-2.3,0-4.52-0.62-6.52-1.75l-2.12,2.12c-0.39,0.39-1.02,0.39-1.41,0l-1.42-1.42c-0.39-0.39-0.39-1.02,0-1.41l2.12-2.12C1.62,10.04,1,7.82,1,5.52c0-0.41,0.34-0.75,0.75-0.75h4c0.35,0,0.66,0.24,0.74,0.58l0.85,3.83c0.07,0.32-0.01,0.66-0.23,0.9L5.5,11.53c0.95,1.86,2.5,3.4,4.37,4.37l1.45-1.45c0.23-0.23,0.58-0.3,0.9-0.23l3.83,0.85c0.34,0.08,0.58,0.39,0.58,0.74v4c0,0.41-0.34,0.75-0.75,0.75C17.3,21,14.67,20.08,12.01,16.46z" transform="rotate(-135 12 12)" /></svg>;

interface VoiceAssistantWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
type ErrorType = 'browser' | 'permission' | 'no-speech' | 'network' | 'unknown' | 'audio-capture';

const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<Status>('idle');
    const [userTranscript, setUserTranscript] = useState('');
    const [aiTranscript, setAiTranscript] = useState('');
    const [error, setError] = useState<{ type: ErrorType, message: string } | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const statusRef = useRef(status);
    statusRef.current = status;

    const resetState = () => {
        setStatus('idle');
        setUserTranscript('');
        setAiTranscript('');
        setError(null);
    }

    const handleError = (type: ErrorType, message: string) => {
        setError({ type, message });
        setStatus('error');
    };

    const getStatusText = () => {
        switch (status) {
            case 'idle': return 'Click the mic to speak';
            case 'listening': return 'Listening...';
            case 'processing': return 'Thinking...';
            case 'speaking': return aiTranscript ? '' : 'Speaking...';
            case 'error': return error?.message || 'An error occurred';
            default: return '';
        }
    };
    
    const playAudio = async (audioDataUrl: string) => {
        try {
            if (!audioContextRef.current || !gainNodeRef.current) {
                throw new Error("Audio system not initialized. This should not happen.");
            }
            
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            gainNodeRef.current.gain.value = isMuted ? 0 : 1;

            const audioData = await fetch(audioDataUrl).then(res => res.arrayBuffer());
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);

            if (audioSourceRef.current) audioSourceRef.current.stop();

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNodeRef.current!);
            source.start(0);
            source.onended = () => {
                if(statusRef.current === 'speaking') {
                     resetState();
                }
            };
            audioSourceRef.current = source;
        } catch (e: any) {
            console.error("Audio playback failed:", e);
            handleError('browser', "Could not play audio response.");
        }
    };
    
    const processSpeech = async (transcript: string) => {
        setStatus('processing');
        setUserTranscript(transcript);
        setAiTranscript('');
        setError(null);
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out. The AI is taking too long.")), 15000) // 15 seconds
        );

        try {
             const response = await Promise.race([
                database.getVoiceResponse(transcript),
                timeoutPromise
            ]) as { audioDataUrl: string, transcription: string };

            setAiTranscript(response.transcription);
            setStatus('speaking');
            await playAudio(response.audioDataUrl);
        } catch (e: any) {
            console.error("Error processing voice command:", e);
            handleError('network', e.message || "Could not connect to the voice service.");
        }
    };

    const startListening = () => {
        // Initialize/Resume AudioContext on first user gesture to unlock it.
        try {
             if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    const context = new AudioContext();
                    audioContextRef.current = context;
                    const gain = context.createGain();
                    gainNodeRef.current = gain;
                    gain.connect(context.destination);
                    
                    // Play a silent sound on first interaction. This is a robust way to unlock
                    // audio playback on all browsers, especially iOS.
                    const buffer = context.createBuffer(1, 1, 22050);
                    const source = context.createBufferSource();
                    source.buffer = buffer;
                    source.connect(context.destination);
                    source.start(0);

                } else {
                     throw new Error("AudioContext not supported");
                }
            }
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        } catch (e: any) {
            console.error("Failed to initialize audio context", e);
            handleError('browser', 'Could not initialize audio system.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            handleError('browser', "Sorry, your browser doesn't support voice recognition.");
            return;
        }

        if (recognitionRef.current) recognitionRef.current.stop();
        resetState();

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setStatus('listening');
        
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPart;
                } else {
                    interimTranscript += transcriptPart;
                }
            }
            setUserTranscript(interimTranscript || finalTranscript);
            if (finalTranscript && statusRef.current === 'listening') {
                processSpeech(finalTranscript.trim());
            }
        };
        
        recognition.onerror = (event: any) => {
            let message = "A speech recognition error occurred.";
            let type: ErrorType = 'unknown';

            switch (event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    message = 'Microphone permission denied.';
                    type = 'permission';
                    break;
                case 'no-speech':
                    message = 'I didn\'t catch that. Please try again.';
                    type = 'no-speech';
                    break;
                case 'network':
                    message = 'Network error. Please check your connection.';
                    type = 'network';
                    break;
                case 'audio-capture':
                    message = 'Could not capture audio from microphone.';
                    type = 'audio-capture';
                    break;
            }
            handleError(type, message);
        };

        recognition.onend = () => {
            if (statusRef.current === 'listening') {
                setStatus('idle');
            }
        };
        recognition.start();
    };
    
    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newMutedState ? 0 : 1;
        }
    };

    const stopAll = () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        resetState();
    };

    const handleClose = () => {
        stopAll();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) stopAll();
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-between z-[100] animate-fade-in p-8">
            <div className="w-full text-center text-white mt-20">
                <p className={`text-2xl font-semibold h-8 transition-opacity duration-300 ${status === 'error' ? 'text-red-400' : 'text-gray-300'}`}>{getStatusText()}</p>
                <div className="mt-4 min-h-[100px] text-lg flex flex-col justify-center items-center p-4">
                    {userTranscript && (
                        <p className="opacity-70 animate-fade-in">{userTranscript}</p>
                    )}
                    {aiTranscript && (
                         <p className="mt-2 text-2xl font-semibold text-cyan-300 animate-fade-in">{aiTranscript}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-center items-center space-x-8">
                <button 
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-yellow-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                >
                   {isMuted ? <MuteIcon /> : <UnmuteIcon />}
                </button>

                <button 
                    onClick={status === 'idle' || status === 'error' ? startListening : undefined}
                    title="Speak"
                    className={`h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 text-white ${status === 'listening' ? 'bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    <MicrophoneIcon />
                </button>
                
                <button 
                    onClick={handleClose}
                    title="End"
                    className="h-16 w-16 rounded-full flex items-center justify-center transition-transform bg-red-600 hover:bg-red-700 text-white hover:scale-110"
                >
                    <EndCallIcon />
                </button>
            </div>
        </div>
    );
};

export default VoiceAssistantWidget;