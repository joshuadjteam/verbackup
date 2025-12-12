import React, { createContext, useContext, ReactNode } from 'react';

type CallState = 'Idle' | 'Outgoing' | 'Incoming' | 'Active';
type ConnectionState = 'Disconnected' | 'Connecting...' | 'Connected' | 'Registering...' | 'Registration Failed';

interface SipContextType {
    connectionState: ConnectionState;
    callState: CallState;
    remoteIdentity: string | null;
    isMuted: boolean;
    error: string | null;
    callDuration: number;
    makeCall: (target: string) => void;
    answerCall: () => void;
    hangupCall: () => void;
    toggleMute: () => void;
}

// Create a context with default empty values
const SipContext = createContext<SipContextType | undefined>(undefined);

// The provider now simply renders its children without any logic.
export const SipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const emptyContext: SipContextType = {
        connectionState: 'Disconnected',
        callState: 'Idle',
        remoteIdentity: null,
        isMuted: false,
        error: 'SIP functionality has been removed.',
        callDuration: 0,
        makeCall: () => {},
        answerCall: () => {},
        hangupCall: () => {},
        toggleMute: () => {},
    };
    
    return (
        <SipContext.Provider value={emptyContext}>
            {children}
        </SipContext.Provider>
    );
};

// The hook returns the empty context values.
export const useSip = (): SipContextType => {
    const context = useContext(SipContext);
    if (context === undefined) {
        // This should not happen if the provider is correctly wrapping the app,
        // but it's good practice to keep the error.
        throw new Error('useSip must be used within a SipProvider');
    }
    return context;
};
