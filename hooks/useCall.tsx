
import React, { createContext, useState, useContext, ReactNode, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../supabaseClient';
import { database } from '../services/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CallContextType {
    isCalling: boolean;
    callee: string;
    callStatus: string;
    isMuted: boolean;
    incomingCall: { from: string; isVideoCall: boolean; } | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isVideoCall: boolean;
    callDuration: number;
    remoteExtraInfo: string | null;
    startP2PCall: (callee: string, withVideo: boolean, extraInfo?: string) => void;
    acceptCall: () => void;
    declineCall: () => void;
    endCall: (targetOverride?: string) => void;
    toggleMute: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
];

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isLoggedIn } = useAuth();
    const [isCalling, setIsCalling] = useState(false);
    const [callee, setCallee] = useState('');
    const [remoteExtraInfo, setRemoteExtraInfo] = useState<string | null>(null);
    const [callStatus, setCallStatus] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ from: string; isVideoCall: boolean; } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const pc = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const offerForIncomingCall = useRef<RTCSessionDescriptionInit | null>(null);
    const callTimeoutRef = useRef<any>(null);
    const callDurationIntervalRef = useRef<any>(null);
    const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);
    const isRemoteSet = useRef(false);
    
    const stateRef = useRef({ user, isCalling, callee, callStatus, incomingCall, localStream, isLoggedIn });
    stateRef.current = { user, isCalling, callee, callStatus, incomingCall, localStream, isLoggedIn };

    // --- Signaling Setup ---
    useEffect(() => {
        if (!isLoggedIn || !user) return;

        const channel = supabase.channel('lynix-global-signaling', {
            config: {
                broadcast: { self: false }
            }
        });

        channel
            .on('broadcast', { event: 'signal' }, ({ payload }) => {
                if (payload.target === user.username) {
                    console.log(`[Signaling] Received ${payload.type} from ${payload.from}`);
                    handleSignal({
                        type: payload.type,
                        payload: payload.data,
                        from: payload.from
                    });
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Connected to Signaling Network');
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [isLoggedIn, user?.username]);

    const sendSignal = useCallback(async (target: string, type: string, data: any) => {
        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                    target: target,
                    from: stateRef.current.user?.username,
                    type: type,
                    data: data
                }
            });
        }
    }, []);

    const processIceQueue = useCallback(async () => {
        if (!pc.current || !isRemoteSet.current) return;
        // Small delay to ensure remote description is fully applied
        await new Promise(r => setTimeout(r, 100));
        
        console.log(`Processing ${iceCandidatesQueue.current.length} buffered ICE candidates`);
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            if (candidate) {
                try {
                    await pc.current.addIceCandidate(candidate);
                } catch (e) {
                    console.error("Error adding buffered ICE candidate", e);
                }
            }
        }
    }, []);

    const stableEndCall = useCallback((targetOverride?: string) => {
        const target = targetOverride || stateRef.current.callee || stateRef.current.incomingCall?.from;
        if (target && stateRef.current.user && (stateRef.current.isCalling || stateRef.current.incomingCall)) {
            sendSignal(target, 'call-ended', { from: stateRef.current.user.username });
        }
        
        if (pc.current) { 
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.close(); 
            pc.current = null; 
        }
        
        if (stateRef.current.localStream) {
            stateRef.current.localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        
        if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
        if (callDurationIntervalRef.current) { clearInterval(callDurationIntervalRef.current); callDurationIntervalRef.current = null; }
        
        iceCandidatesQueue.current = [];
        isRemoteSet.current = false;
        setRemoteStream(null); setIsVideoCall(false); setIsCalling(false); setCallee(''); setCallStatus(''); setCallDuration(0); setIncomingCall(null); setRemoteExtraInfo(null);
        offerForIncomingCall.current = null;
    }, [sendSignal]);
    
    const createPeerConnection = useCallback(async (targetUsername: string, stream: MediaStream): Promise<RTCPeerConnection> => {
        const peer = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
        
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        
        peer.onicecandidate = e => { 
            if (e.candidate) sendSignal(targetUsername, 'ice-candidate', { candidate: e.candidate }); 
        };
        
        peer.ontrack = e => {
            if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
        };
        
        peer.onconnectionstatechange = () => {
            console.log("Connection State:", peer.connectionState);
            switch(peer.connectionState) {
                case 'connected':
                    setCallStatus('Connected');
                    if (callDurationIntervalRef.current) clearInterval(callDurationIntervalRef.current);
                    callDurationIntervalRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
                    break;
                case 'failed':
                case 'closed':
                    // Only end if we were actually connected or connecting
                    if (stateRef.current.callStatus !== 'Call Ended') {
                        stableEndCall(targetUsername);
                    }
                    break;
            }
        };
        
        pc.current = peer;
        return peer;
    }, [sendSignal, stableEndCall]);

    const handleSignal = async (msg: any) => {
        const { type, payload, from } = msg;
        
        switch (type) {
            case 'incoming-call': 
                if (stateRef.current.isCalling) {
                    sendSignal(from, 'call-declined', { reason: 'busy' });
                } else {
                    setIncomingCall({ from: from, isVideoCall: payload.isVideoCall }); 
                    offerForIncomingCall.current = payload.offer; 
                }
                break;
            case 'call-accepted': 
                if (pc.current && stateRef.current.callee === from) { 
                    try { 
                        await pc.current.setRemoteDescription(new RTCSessionDescription(payload.answer)); 
                        isRemoteSet.current = true;
                        setCallStatus('Connecting...'); 
                        await processIceQueue();
                        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current); 
                    } catch(e) { 
                        console.error("Error setting remote desc (Answer):", e); 
                        stableEndCall(from); 
                    } 
                } 
                break;
            case 'call-declined': 
                if (stateRef.current.isCalling && stateRef.current.callee === from) { 
                    setCallStatus('Call Declined'); 
                    setTimeout(() => stableEndCall(from), 2000); 
                } 
                break;
            case 'call-ended': 
                stableEndCall(from); 
                break;
            case 'ice-candidate': 
                if (payload.candidate) {
                    const candidate = new RTCIceCandidate(payload.candidate);
                    if (pc.current && isRemoteSet.current) {
                        try {
                            await pc.current.addIceCandidate(candidate);
                        } catch(e) {
                            console.error("Error adding ICE candidate", e);
                        }
                    } else {
                        iceCandidatesQueue.current.push(candidate);
                    }
                }
                break;
        }
    };

    const startP2PCall = useCallback(async (calleeUsername: string, withVideo: boolean, extraInfo?: string) => {
        try {
            if (!stateRef.current.user) throw new Error("User not logged in.");
            
            if (calleeUsername === stateRef.current.user.username) {
                setCallStatus('Cannot call self');
                setTimeout(() => setCallStatus(''), 2000);
                return;
            }
            
            if (!channelRef.current) {
                setCallStatus('Network error');
                setTimeout(() => setCallStatus(''), 2000);
                return;
            }

            // Reset state
            iceCandidatesQueue.current = [];
            isRemoteSet.current = false;
            setIsCalling(true); 
            setCallStatus('Initializing...'); 
            setIsVideoCall(withVideo); 
            setCallee(calleeUsername);
            if (extraInfo) setRemoteExtraInfo(extraInfo);
            
            // Get Media first to ensure permissions
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
            setLocalStream(stream);
            
            // Create PC
            const peerConnection = await createPeerConnection(calleeUsername, stream);
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            // Send Invite
            sendSignal(calleeUsername, 'incoming-call', { isVideoCall: withVideo, offer });
            setCallStatus('Ringing...');
            
            // Timeout
            callTimeoutRef.current = setTimeout(() => { 
                if(stateRef.current.isCalling && stateRef.current.callStatus.startsWith('Ringing')) { 
                    setCallStatus('No answer'); 
                    setTimeout(() => stableEndCall(calleeUsername), 3000); 
                } 
            }, 45000); 
            
        } catch (error: any) { 
            console.error('Error starting P2P call:', error); 
            setCallStatus(`Call Failed`);
            // Clean up immediately if setup failed
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
                setLocalStream(null);
            }
            setIsCalling(false);
            setTimeout(() => setCallStatus(''), 3000);
        }
    }, [createPeerConnection, sendSignal, stableEndCall]);

    const acceptCall = useCallback(async () => {
        if (!stateRef.current.incomingCall || !stateRef.current.user || !offerForIncomingCall.current) return;
        const caller = stateRef.current.incomingCall.from;
        try {
            // Reset queue
            iceCandidatesQueue.current = [];
            isRemoteSet.current = false;
            
            setIsCalling(true); 
            setCallStatus('Connecting...'); 
            setCallee(caller); 
            setIsVideoCall(stateRef.current.incomingCall.isVideoCall);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: stateRef.current.incomingCall.isVideoCall });
            setLocalStream(stream);
            
            const peerConnection = await createPeerConnection(caller, stream);
            
            // Set remote description first (the offer)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offerForIncomingCall.current));
            isRemoteSet.current = true;
            
            // Process any ICE candidates that arrived while we were setting up
            await processIceQueue();

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            sendSignal(caller, 'call-accepted', { answer });
            setIncomingCall(null); 
            offerForIncomingCall.current = null;
        } catch (error: any) { 
            console.error("Error accepting call:", error); 
            stableEndCall(caller); 
        }
    }, [createPeerConnection, sendSignal, stableEndCall, processIceQueue]);

    const declineCall = useCallback(() => {
        if (!stateRef.current.incomingCall || !stateRef.current.user) return;
        sendSignal(stateRef.current.incomingCall.from, 'call-declined', { from: stateRef.current.user.username });
        setIncomingCall(null); offerForIncomingCall.current = null;
    }, [sendSignal]);

    const toggleMute = useCallback(() => {
        if (stateRef.current.localStream) {
            const audioTracks = stateRef.current.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const newMutedState = !audioTracks[0].enabled;
                audioTracks.forEach(track => { track.enabled = newMutedState; });
                setIsMuted(!newMutedState);
            }
        }
    }, []);

    const value = { 
        isCalling, callee, callStatus, isMuted, incomingCall, localStream, remoteStream, isVideoCall, callDuration, remoteExtraInfo,
        startP2PCall, acceptCall, declineCall, endCall: stableEndCall, toggleMute 
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = (): CallContextType => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};
