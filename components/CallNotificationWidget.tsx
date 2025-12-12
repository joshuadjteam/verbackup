
import React, { useEffect, useState, useRef } from 'react';
import { useCall } from '../hooks/useCall';
import { useTheme } from '../hooks/useTheme';
import useIsMobileDevice from '../hooks/useIsMobileDevice';

// Icons
const DeclineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01,16.46c-2.3,0-4.52-0.62-6.52-1.75l-2.12,2.12c-0.39,0.39-1.02,0.39-1.41,0l-1.42-1.42c-0.39-0.39-0.39-1.02,0-1.41l2.12-2.12C1.62,10.04,1,7.82,1,5.52c0-0.41,0.34-0.75,0.75-0.75h4c0.35,0,0.66,0.24,0.74,0.58l0.85,3.83c0.07,0.32-0.01,0.66-0.23,0.9L5.5,11.53c0.95,1.86,2.5,3.4,4.37,4.37l1.45-1.45c0.23-0.23,0.58-0.3,0.9-0.23l3.83,0.85c0.34,0.08,0.58,0.39,0.58,0.74v4c0,0.41-0.34,0.75-0.75,0.75C17.3,21,14.67,20.08,12.01,16.46z" transform="rotate(-135 12 12)" /></svg>;
const AcceptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01,16.46c-2.3,0-4.52-0.62-6.52-1.75l-2.12,2.12c-0.39,0.39-1.02,0.39-1.41,0l-1.42-1.42c-0.39-0.39-0.39-1.02,0-1.41l2.12-2.12C1.62,10.04,1,7.82,1,5.52c0-0.41,0.34-0.75,0.75-0.75h4c0.35,0,0.66,0.24,0.74,0.58l0.85,3.83c0.07,0.32-0.01,0.66-0.23,0.9L5.5,11.53c0.95,1.86,2.5,3.4,4.37,4.37l1.45-1.45c0.23-0.23,0.58-0.3,0.9-0.23l3.83,0.85c0.34,0.08,0.58,0.39,0.58,0.74v4c0,0.41-0.34,0.75-0.75,0.75C17.3,21,14.67,20.08,12.01,16.46z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.11 15.11 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.59 3.91.97.97 0 007.62 3H4.21a1 1 0 00-1 1c0 8.84 7.16 16 16 16a1 1 0 001-1v-3.41a.97.97 0 00-.96-.98z"/></svg>;

const CallNotificationWidget: React.FC = () => {
    const { 
        isCalling,
        callStatus,
        callee,
        incomingCall, 
        acceptCall, 
        declineCall,
        endCall
    } = useCall();
    const { isDark, glassBlur, glassTransparency } = useTheme();
    const isMobile = useIsMobileDevice();

    const [isVisible, setIsVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [statusText, setStatusText] = useState('');
    const [statusClassName, setStatusClassName] = useState('text-gray-300');
    const [actions, setActions] = useState<'incoming' | 'outgoing' | 'none'>('none');

    const dismissTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (dismissTimerRef.current) {
            window.clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }

        const terminalStates = ['Call Declined', 'User unavailable', 'No answer'];
        const isTerminal = terminalStates.includes(callStatus) || callStatus.startsWith('Error');

        if (incomingCall) {
            setIsVisible(true);
            setTitle(incomingCall.from);
            const callType = incomingCall.isVideoCall ? 'Video Call' : 'Mobile Call';
            setStatusText(`Incoming ${callType}`);
            setStatusClassName('text-white');
            setActions('incoming');
        } else if (isCalling) {
            // On mobile, active call UI is fullscreen, so we only show this if navigated away or initial ring
            // But for "outgoing", we usually don't show heads-up unless minimizing.
            // We'll keep it simple: Show notification only if Incoming OR Call Failed state.
            // If active/ringing outgoing, CallWidget covers it.
            
            if (isTerminal) {
                setIsVisible(true);
                setTitle(callee);
                setStatusText(callStatus);
                setStatusClassName('text-red-400');
                setActions('none');
                dismissTimerRef.current = window.setTimeout(() => {
                    endCall();
                    setIsVisible(false);
                }, 3000);
            } else {
                setIsVisible(false);
            }
        } else {
            setIsVisible(false);
        }

        return () => {
            if (dismissTimerRef.current) {
                window.clearTimeout(dismissTimerRef.current);
            }
        };

    }, [isCalling, callStatus, callee, incomingCall, endCall]);

    if (!isVisible) {
        return null;
    }
    
    if (isMobile) {
        // Android 14 Style Heads-Up Notification
        return (
            <div className="fixed top-2 left-2 right-2 z-[9999] animate-fade-in-up">
                <div className="bg-[#303030] text-white rounded-[28px] p-3 shadow-xl flex items-center justify-between border border-white/10">
                    <div className="flex items-center space-x-3 pl-1">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                            {title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-base font-medium leading-tight">{title}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <PhoneIcon /> {statusText}
                            </p>
                        </div>
                    </div>
                    
                    {actions === 'incoming' && (
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={declineCall} 
                                className="w-20 h-10 bg-red-200 text-red-900 rounded-full flex items-center justify-center font-medium text-sm"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={acceptCall} 
                                className="w-20 h-10 bg-[#c4eed0] text-[#072711] rounded-full flex items-center justify-center font-medium text-sm"
                            >
                                Answer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Style
    const baseBgColor = isDark 
        ? `rgba(45, 55, 72, ${glassTransparency})`
        : `rgba(255, 255, 255, ${glassTransparency})`;
    const borderColor = isDark ? 'border-white/20' : 'border-black/10';

    return (
        <div 
            className={`fixed top-5 right-5 w-full max-w-sm p-6 text-center z-[100] animate-fade-in-up border rounded-2xl shadow-2xl ${borderColor}`}
            style={{
                backgroundColor: baseBgColor,
                backdropFilter: `blur(${glassBlur}px)`
            }}
        >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center font-bold text-3xl text-white mx-auto mb-3">
                {title.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold mb-1 text-light-text dark:text-dark-text">{title}</h2>
            <p className={`text-md mb-6 h-6 ${statusClassName}`}>{statusText}</p>

            {actions === 'incoming' && (
                <div className="flex justify-around items-center">
                    <div className="flex flex-col items-center">
                        <button onClick={declineCall} className="h-16 w-16 rounded-full flex items-center justify-center transition-transform bg-red-600 hover:bg-red-700 text-white font-semibold hover:scale-110" aria-label="Decline call">
                            <DeclineIcon />
                        </button>
                        <span className="mt-2 text-sm text-light-text dark:text-dark-text">Decline</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button onClick={acceptCall} className="h-16 w-16 rounded-full flex items-center justify-center transition-transform bg-green-600 hover:bg-green-700 text-white font-semibold hover:scale-110" aria-label="Accept call">
                           <AcceptIcon />
                        </button>
                        <span className="mt-2 text-sm text-light-text dark:text-dark-text">Accept</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallNotificationWidget;
