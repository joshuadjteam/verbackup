
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const AccountInvalidScreen: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="fixed inset-0 bg-[#121212] text-white flex flex-col items-center justify-center p-8 z-[20000] animate-fade-in text-center">
            <WarningIcon />
            <h1 className="text-3xl font-bold mb-4 text-red-500">Account Invalid</h1>
            <p className="text-lg text-gray-300 mb-8">
                Your account cannot access the Lynix platform at this time.
            </p>
            
            <div className="bg-[#1e1e1e] p-6 rounded-xl w-full max-w-sm mb-8 text-left border border-red-900/30">
                <p className="text-sm text-gray-400 mb-4 uppercase font-bold tracking-wider">Possible Reasons:</p>
                <ul className="space-y-3 text-sm text-gray-200 list-disc pl-5">
                    <li>Account has been deleted</li>
                    <li>Mobile Access is not enabled for this plan</li>
                    <li>Account status is Invalid or Suspended</li>
                    <li>Trial period has expired</li>
                    <li>Regional restrictions apply to your current location</li>
                </ul>
            </div>

            <button 
                onClick={() => logout()}
                className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
};

export default AccountInvalidScreen;
