
import React, { useState } from 'react';
import HelpModal from './HelpModal';

const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093v.001M12 17h.01" /></svg>;


const Footer: React.FC = () => {
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);

    return (
        <>
            <footer className="w-full bg-white/30 dark:bg-gray-900/50 backdrop-blur-sm text-gray-600 dark:text-gray-400 text-sm shadow-inner py-3">
                <div className="container mx-auto px-4 flex justify-center items-center space-x-4 flex-wrap">
                    <p>&copy; 2025 Lynix Technology and Coding. All Rights Reserved.</p>
                    <div className="hidden sm:block w-px h-4 bg-gray-400 dark:bg-gray-600"></div>
                    <a href="https://djteams.ca/termsofservice" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Terms of Service</a>
                    <div className="w-px h-4 bg-gray-400 dark:bg-gray-600"></div>
                    <a href="https://djteams.ca/apppripollnk" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                    <div className="hidden sm:block w-px h-4 bg-gray-400 dark:bg-gray-600"></div>
                     <a href="https://www.youtube.com/@DarCodR" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 font-semibold transition-colors flex items-center space-x-1">
                        <YoutubeIcon />
                        <span>YouTube</span>
                    </a>
                </div>
            </footer>
            <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-3 z-50">
                <button 
                    onClick={() => setHelpModalOpen(true)} 
                    className="w-14 h-14 bg-indigo-600 dark:bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors shadow-lg group"
                    aria-label="Help and Support"
                >
                    <HelpIcon />
                    <span className="absolute right-full mr-3 hidden group-hover:block bg-light-text dark:bg-dark-card text-light-card dark:text-dark-text text-xs rounded py-1 px-2 whitespace-nowrap">Help & Support</span>
                </button>
            </div>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
        </>
    );
};

export default Footer;
