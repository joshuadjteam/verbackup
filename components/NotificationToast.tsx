
import React, { useEffect, useState } from 'react';

export interface NotificationProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
}

// Database/User Icon for the specific request
export const DatabaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

interface NotificationToastProps {
    notification: NotificationProps | null;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [notification]);

    if (!notification) return null;

    return (
        <div className={`fixed top-12 left-4 right-4 z-[20000] flex justify-center transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
            <div className="bg-[#2d2d2d] text-white rounded-2xl shadow-2xl p-4 flex items-center space-x-4 max-w-md w-full border border-white/10 backdrop-blur-md">
                <div className="bg-white/10 p-2 rounded-full">
                    {notification.icon || <DatabaseIcon />}
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-sm text-gray-200">{notification.title}</h4>
                    <p className="text-xs text-gray-400">{notification.message}</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
