
import React, { useRef, useEffect, useState } from 'react';
import { useCall } from '../hooks/useCall';

// Icons (Android 14 Style)
const MicOff = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-400q-33 0-56.5-23.5T400-480v-166L262-784l42-42 516 516-42 42-118-118v66q0 33-23.5 56.5T580-240H380v60h200v80h-60v40h-80v-40h-60v-80h-62l262-262v42ZM720-480v-80h80v80h-80Zm-440 0v-80h80v80h-80Zm166-296-66-66v-18q0-33 23.5-56.5T460-940h40q33 0 56.5 23.5T580-860v164Z"/></svg>;
const MicOn = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-400q-33 0-56.5-23.5T400-480v-240q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720v240q0 33-23.5 56.5T480-400Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-720q0-17-11.5-28.5T480-760q-17 0-28.5 11.5T440-720q0 17 11.5 28.5T480-480Z"/></svg>;
const Keypad = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm160-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm200 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80ZM160-240v-480 480Z"/></svg>;
const Speaker = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>;
const EndCall = () => <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="white"><path d="M200-200v-560h560v560H200Zm80-80h400v-400H280v400Zm0-400v400-400Z" transform="rotate(45 480 480)"/></svg>; // Simulate X or phone down by logic, but icon here is distinct red usually

const CallWidget: React.FC = () => {
    const { 
        isCalling, callee, callStatus, endCall,
        isMuted, toggleMute, 
        callDuration, localStream, remoteStream, isVideoCall, remoteExtraInfo
    } = useCall();
    
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
    
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isVideoCall]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (!isCalling || callStatus !== 'Connected' && !callStatus.includes('Ringing') && !callStatus.includes('Calling')) {
        return null;
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Google Phone Style Display Logic
    const displayName = callee;
    const displayNumber = remoteExtraInfo || "Mobile"; // If extra info (phone number) exists, use it, else "Mobile"
    const statusDisplay = callStatus === 'Connected' ? formatDuration(callDuration) : `Ringing : ${displayName}`;

    return (
        <div className="fixed inset-0 bg-[#1c1b1f] z-[9999] flex flex-col font-sans animate-fade-in">
            {/* Background Video (if applicable) */}
            {remoteStream && (
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`absolute top-0 left-0 w-full h-full object-cover ${isVideoCall ? 'block' : 'hidden'}`} 
                />
            )}

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 ${isVideoCall ? 'bg-gradient-to-b from-black/60 via-transparent to-black/80' : 'bg-[#1c1b1f]'}`}></div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full pt-20 pb-12 px-8">
                
                {/* Top Info Area */}
                <div className="flex flex-col items-center space-y-4 mt-10">
                    {/* Avatar */}
                    {!isVideoCall && (
                        <div className="w-32 h-32 rounded-full bg-[#a8c7fa] text-[#041e49] flex items-center justify-center text-6xl font-medium shadow-2xl mb-4">
                            {callee.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    <h1 className="text-4xl font-normal text-white tracking-tight">{displayName}</h1>
                    
                    <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg text-[#e3e3e3]">{statusDisplay}</span>
                        {remoteExtraInfo && <span className="text-sm text-[#c4c7c5]">{remoteExtraInfo}</span>}
                    </div>
                </div>

                <div className="flex-grow"></div>

                {/* Action Buttons Grid */}
                <div className="w-full max-w-xs mx-auto grid grid-cols-3 gap-x-8 gap-y-8 mb-12">
                    <div className="flex flex-col items-center space-y-2">
                        <button 
                            onClick={toggleMute}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-[#474747] text-white'}`}
                        >
                            {isMuted ? <MicOff /> : <MicOn />}
                        </button>
                        <span className="text-xs text-[#c4c7c5] font-medium">Mute</span>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                        <button className="w-16 h-16 rounded-full bg-[#474747] text-white flex items-center justify-center">
                            <Keypad />
                        </button>
                        <span className="text-xs text-[#c4c7c5] font-medium">Keypad</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <button className="w-16 h-16 rounded-full bg-[#474747] text-white flex items-center justify-center">
                            <Speaker />
                        </button>
                        <span className="text-xs text-[#c4c7c5] font-medium">Speaker</span>
                    </div>
                </div>

                {/* End Call Button */}
                <div className="flex justify-center">
                    <button 
                        onClick={() => endCall()}
                        className="w-20 h-20 rounded-full bg-[#ffb4ab] hover:bg-[#ff897d] flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    >
                        <div className="bg-[#690005] p-3 rounded-full">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                    </button>
                </div>
            </div>

            {/* PIP Self View */}
            {isVideoCall && localStream && (
                <div className="absolute top-16 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20 z-20">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
};

export default CallWidget;
