
import React from 'react';
import { Page } from '../types';

// Icons
const ConsoleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

interface FullScreenAppHeaderProps {
    navigate: (page: Page, params?: any) => void;
    pageParams?: any;
}

const FullScreenAppHeader: React.FC<FullScreenAppHeaderProps> = ({ navigate, pageParams }) => {

    const NavButton: React.FC<{ onClick: () => void, text: string, icon: React.ReactNode }> = ({ onClick, text, icon }) => (
        <button
            onClick={onClick}
            title={text}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2 text-gray-300 hover:bg-white/20 hover:text-white`}
        >
            {icon}
            <span>{text}</span>
        </button>
    );

    return (
        <header className="w-full bg-[#0F2830] text-white shadow-md z-10 flex-shrink-0">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('home')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="11" fill="#4A5568"/>
                        <path d="M15.9042 7.15271C14.4682 6.42517 12.8251 6 11.0625 6C7.16117 6 4 9.13401 4 13C4 16.866 7.16117 20 11.0625 20C12.8251 20 14.4682 19.5748 15.9042 18.8473" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8.09583 16.8473C9.53181 17.5748 11.1749 18 12.9375 18C16.8388 18 20 14.866 20 11C20 7.13401 16.8388 4 12.9375 4C11.1749 4 9.53181 4.42517 8.09583 5.15271" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-2xl font-bold text-white">{pageParams?.title || 'Lynix'}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <NavButton onClick={() => navigate('profile')} text="Settings" icon={<SettingsIcon />} />
                    <NavButton onClick={() => navigate('home')} text="Console" icon={<ConsoleIcon />} />
                </div>
            </div>
        </header>
    );
};

export default FullScreenAppHeader;
