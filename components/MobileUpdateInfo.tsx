
import React, { useState } from 'react';

const UpdateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface MobileUpdateInfoProps {
    version: string;
    onComplete: () => void;
}

const MobileUpdateInfo: React.FC<MobileUpdateInfoProps> = ({ version, onComplete }) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="fixed inset-0 bg-[#121212] text-white z-[15000] flex flex-col p-8 animate-fade-in">
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <UpdateIcon />
                <h1 className="text-3xl font-bold mb-2">Update Complete</h1>
                <p className="text-xl text-green-400 mb-8">Lynix is now running version {version}</p>
                
                <div className="bg-[#1e1e1e] p-6 rounded-2xl w-full max-w-md text-left border border-gray-800 shadow-lg overflow-y-auto max-h-[40vh]">
                    <h3 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">What's New</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                        <li>New App Drawer with swipe-up gesture</li>
                        <li>Enhanced security and privacy features</li>
                        <li>Improved performance and stability</li>
                        <li>Multi-language support (EN, FR, ES)</li>
                        <li>New native apps: Maps, Music, Gallery</li>
                    </ul>
                </div>
            </div>

            <div className="w-full max-w-md mx-auto pt-6">
                <label className="flex items-start space-x-3 p-4 bg-[#1e1e1e] rounded-xl border border-gray-800 cursor-pointer mb-6 hover:bg-[#252525] transition-colors">
                    <input 
                        type="checkbox" 
                        checked={accepted} 
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="text-sm text-gray-400">
                        I agree to the updated <a href="https://djteams.ca/termsofservice" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">Terms of Service</a> and confirm that I have read the changelog.
                    </span>
                </label>

                <button 
                    onClick={onComplete}
                    disabled={!accepted}
                    className={`w-full font-bold py-4 rounded-2xl text-lg transition-all shadow-lg ${accepted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                    Continue to Home
                </button>
            </div>
        </div>
    );
};

export default MobileUpdateInfo;
