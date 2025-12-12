
import React from 'react';
import { Page } from '../../types';
import WhoAmIView from '../../components/WhoAmIView';

interface WhoAmIAppProps {
    navigate: (page: Page) => void;
    autoStartTest?: boolean;
}

const WhoAmIApp: React.FC<WhoAmIAppProps> = ({ navigate, autoStartTest }) => {
    return (
        <div className="w-full h-full flex flex-col bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text overflow-hidden">
            <div className="p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">System Identity & Diagnostics</h1>
                    <WhoAmIView autoStartTest={autoStartTest} />
                </div>
            </div>
        </div>
    );
};

export default WhoAmIApp;
