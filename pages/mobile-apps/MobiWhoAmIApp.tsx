
import React from 'react';
import { Page } from '../../types';
import WhoAmIView from '../../components/WhoAmIView';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiWhoAmIAppProps {
    navigate: (page: Page) => void;
}

const MobiWhoAmIApp: React.FC<MobiWhoAmIAppProps> = ({ navigate }) => {
    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans">
            <header className="flex-shrink-0 p-4 flex items-center space-x-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold">WhoAmI?</h1>
            </header>
            <div className="flex-grow overflow-y-auto p-4">
                <WhoAmIView />
            </div>
        </div>
    );
};

export default MobiWhoAmIApp;
