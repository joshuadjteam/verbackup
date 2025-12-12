
import React, { useState } from 'react';

const MobiCalculatorApp: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    const handleButtonClick = (value: string) => {
        if (value === 'AC') {
            setDisplay('0');
            setExpression('');
        } else if (value === '=') {
            try {
                const result = eval(expression.replace(/x/g, '*').replace(/÷/g, '/'));
                setDisplay(String(result));
                setExpression(String(result));
            } catch (error) {
                setDisplay('Error');
                setExpression('');
            }
        } else if (['+', '-', 'x', '÷', '%'].includes(value)) {
            setExpression(prev => prev + ` ${value} `);
            setDisplay(value);
        } else {
            if (display === '0' || ['+', '-', 'x', '÷', '%'].includes(display)) {
                setDisplay(value);
            } else {
                setDisplay(prev => prev + value);
            }
            setExpression(prev => prev + value);
        }
    };
    
    const Button: React.FC<{ value: string; type?: 'number' | 'operator' | 'action' }> = ({ value, type = 'number' }) => {
        let bgColor = 'bg-[#2D2F31]'; // Dark grey numbers
        let textColor = 'text-white';
        
        if (type === 'operator') {
            bgColor = 'bg-[#A8C7FA]'; // Pastel Blue accent (Android 14 style)
            textColor = 'text-[#041E49]';
        } else if (type === 'action') {
            bgColor = 'bg-[#444746]'; // Lighter grey
        }

        return (
            <button
                onClick={() => handleButtonClick(value)}
                className={`${bgColor} ${textColor} w-16 h-16 rounded-full text-2xl font-medium flex items-center justify-center active:opacity-80 transition-opacity`}
            >
                {value}
            </button>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#131314] text-white font-sans p-4">
            <div className="flex-grow flex flex-col justify-end items-end pb-6 px-2">
                <div className="text-white/70 text-xl mb-2 truncate w-full text-right">{expression}</div>
                <div className="text-6xl font-normal truncate w-full text-right">{display}</div>
            </div>
            <div className="grid grid-cols-4 gap-4 justify-items-center pb-4">
                <Button value="AC" type="action" />
                <Button value="( )" type="action" />
                <Button value="%" type="action" />
                <Button value="÷" type="operator" />

                <Button value="7" />
                <Button value="8" />
                <Button value="9" />
                <Button value="x" type="operator" />
                
                <Button value="4" />
                <Button value="5" />
                <Button value="6" />
                <Button value="-" type="operator" />

                <Button value="1" />
                <Button value="2" />
                <Button value="3" />
                <Button value="+" type="operator" />
                
                <Button value="0" />
                <Button value="." />
                <button className="w-16 h-16 rounded-full bg-[#2D2F31] flex items-center justify-center active:opacity-80" onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                </button>
                <Button value="=" type="operator" />
            </div>
        </div>
    );
};

export default MobiCalculatorApp;
