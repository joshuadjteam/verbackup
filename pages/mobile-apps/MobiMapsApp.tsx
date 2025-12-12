
import React from 'react';
import { Page } from '../../types';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;

interface MobiMapsAppProps {
    navigate: (page: Page) => void;
}

const MobiMapsApp: React.FC<MobiMapsAppProps> = ({ navigate }) => {
    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {/* Simple Floating Header */}
            <div className="absolute top-4 left-4 z-10">
                <button onClick={() => navigate('home')} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 text-black">
                    <BackIcon />
                </button>
            </div>
            
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12090.486699054666!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1632948563211!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="Maps"
            ></iframe>
        </div>
    );
};

export default MobiMapsApp;
