

import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    // YYYY-MM-DD
    const date1 = time.toISOString().split('T')[0];

    // Nov 16 2025
    const date2 = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 2:45 pm
    const time1 = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    
    // (14:45)
    const time2 = `(${time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})`;

    return (
        <div className="text-center font-semibold space-y-1">
            <div className="text-sm">The date is</div>
            <div className="text-lg">{date1}</div>
            <div className="text-lg">{date2}</div>
            <div className="pt-2 text-lg">{time1} {time2}</div>
        </div>
    );
};

export default Clock;