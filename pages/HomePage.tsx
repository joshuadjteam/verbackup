

import React, { useState } from 'react';
import Clock from '../components/Clock';
import AppContainer from '../components/AppContainer';
import { Page } from '../types';

interface HomePageProps {
    navigate: (page: Page, params?: any) => void;
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(url, '_blank');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <div className="relative w-full max-w-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full flex items-center shadow-lg">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">G</span>
                <input
                    type="text"
                    placeholder="Search with Google..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent text-white rounded-full py-3 pl-12 pr-28 focus:outline-none"
                />
                <button 
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <SearchIcon />
                    <span>Search</span>
                </button>
            </div>

            <AppContainer className="w-full p-8 text-center text-light-text dark:text-white">
                <h1 className="text-4xl font-bold mb-4">Welcome to Lynix by DJTeam!</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Welcome to Lynix, where innovation in technology and coding comes to life. Since our inception in January 2024, we've been dedicated to pushing the boundaries of web development. We launched our first suite of products in July 2024 and began sharing our journey on our YouTube channel '@DarCodR'. Today, our primary mission remains rooted in creating powerful coding solutions, while expanding our services to include reliable email support, crystal-clear SIP Voice communication, and more. Explore what we have to offer.
                </p>
                <div className="mt-8">
                    <Clock />
                </div>
            </AppContainer>
        </div>
    );
};

export default HomePage;