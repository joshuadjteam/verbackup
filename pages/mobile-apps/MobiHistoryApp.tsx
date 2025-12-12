
import React from 'react';
import { Page } from '../../types';

interface MobiHistoryAppProps {
    navigate: (page: Page, params?: any) => void;
}

const MobiHistoryApp: React.FC<MobiHistoryAppProps> = ({ navigate }) => {
     return (
        <div className="w-full h-full flex items-center justify-center bg-dark-bg text-light-text dark:text-white p-4">
             <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">History Removed</h1>
                <p>The history feature has been disabled.</p>
                <button onClick={() => navigate('home')} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">Go Home</button>
             </div>
        </div>
    );
};

export default MobiHistoryApp;
