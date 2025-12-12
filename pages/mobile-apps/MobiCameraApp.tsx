
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page } from '../../types';
import { database } from '../../services/database';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const SwitchCameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

interface MobiCameraAppProps {
    navigate: (page: Page) => void;
}

const MobiCameraApp: React.FC<MobiCameraAppProps> = ({ navigate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);

    const getDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
        } catch (err) {
            console.error("Error listing devices:", err);
        }
    };

    const startCamera = useCallback(async (deviceIndex = 0) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        try {
            // Default to environment if no devices found yet (initial load)
            const constraints: MediaStreamConstraints = {
                video: devices.length > 0 
                    ? { deviceId: { exact: devices[deviceIndex].deviceId } }
                    : { facingMode: 'environment' },
                audio: false 
            };
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError('');
        } catch (err: any) {
            console.error("Camera access denied:", err);
            setError("Camera access denied or not available.");
        }
    }, [devices]);

    useEffect(() => {
        getDevices().then(() => startCamera());
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleSwitchCamera = () => {
        if (devices.length > 1) {
            const nextIndex = (currentDeviceIndex + 1) % devices.length;
            setCurrentDeviceIndex(nextIndex);
            startCamera(nextIndex);
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Explicitly set canvas dimensions to video stream dimensions
        // This ensures high quality capture and avoids distortion
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Start upload process
        setIsUploading(true);
        setUploadStatus('Saving to Drive...');

        // 1. Check if Drive is linked
        const isLinked = await database.isDriveLinked();
        if (!isLinked) {
            setIsUploading(false);
            setShowErrorModal(true);
            return;
        }

        // 2. Upload to /lynix/photos/
        try {
            const { success, error } = await database.uploadPhotoToDrive(imageDataUrl);
            if (success) {
                setUploadStatus('Photo Saved!');
                setTimeout(() => setUploadStatus(''), 2000);
            } else {
                setUploadStatus(`Upload failed: ${error}`);
                setTimeout(() => setUploadStatus(''), 3000);
            }
        } catch (e: any) {
            setUploadStatus(`Error: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full h-full bg-black relative flex flex-col">
            {/* Viewfinder */}
            <div className="flex-grow relative overflow-hidden bg-black flex items-center justify-center">
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                        <p>{error}</p>
                    </div>
                ) : (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                {/* Status Toast */}
                {uploadStatus && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-fade-in z-30">
                        {uploadStatus}
                    </div>
                )}
            </div>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-20">
                <button onClick={() => navigate('home')} className="p-2">
                    <BackIcon />
                </button>
            </div>

            {/* Controls */}
            <div className="h-32 bg-black/40 backdrop-blur-sm absolute bottom-0 left-0 right-0 flex items-center justify-around z-20">
                <button className="p-4 rounded-full bg-black/20 w-16 h-16"></button>
                
                <button 
                    onClick={handleCapture}
                    disabled={isUploading}
                    className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                >
                    <div className="w-16 h-16 bg-white rounded-full"></div>
                </button>

                <button onClick={handleSwitchCamera} className="p-4 rounded-full active:bg-white/10">
                    <SwitchCameraIcon />
                </button>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="bg-[#1e1e1e] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-700 animate-fade-in">
                        <div className="flex justify-center mb-4">
                            <WarningIcon />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Error X6A</h2>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            We cannot find the storage for 'Google', please add your 'Google' ID to save photos.
                        </p>
                        <button 
                            onClick={() => { setShowErrorModal(false); navigate('profile'); }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Go to Settings
                        </button>
                        <button 
                            onClick={() => setShowErrorModal(false)}
                            className="mt-4 text-gray-400 text-sm hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobiCameraApp;
