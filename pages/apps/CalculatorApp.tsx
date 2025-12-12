import React, { useState } from 'react';

const CalculatorApp: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    const handleButtonClick = (value: string) => {
        if (value === 'C') {
            setDisplay('0');
            setExpression('');
        } else if (value === '=') {
            try {
                // Using eval is generally unsafe, but acceptable for this self-contained calculator demo.
                // A safer implementation would use a math expression parser.
                const result = eval(expression.replace(/x/g, '*').replace(/÷/g, '/'));
                setDisplay(String(result));
                setExpression(String(result));
            } catch (error) {
                setDisplay('Error');
                setExpression('');
            }
        } else if (['+', '-', 'x', '÷'].includes(value)) {
            setExpression(prev => prev + ` ${value} `);
            setDisplay(value);
        } else {
            if (display === '0' || ['+', '-', 'x', '÷'].includes(display)) {
                setDisplay(value);
            } else {
                setDisplay(prev => prev + value);
            }
            setExpression(prev => prev + value);
        }
    };
    
    const Button: React.FC<{ value: string; className?: string }> = ({ value, className }) => (
        <button
            onClick={() => handleButtonClick(value)}
            className={`bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-4xl font-semibold rounded-lg transition-colors flex items-center justify-center ${className}`}
        >
            {value}
        </button>
    );

    return (
        <div className="w-full h-full flex flex-col items-center p-4 sm:p-8 bg-dark-bg text-light-text dark:text-white">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
                <h1 className="text-4xl font-bold mb-6 text-center flex-shrink-0">Calculator</h1>
                <div className="bg-gray-200 dark:bg-slate-900 rounded-lg p-4 text-right text-7xl font-mono mb-6 break-words min-h-[100px] flex items-center justify-end">
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-4 flex-grow">
                    <Button value="C" className="col-span-2 bg-red-600 hover:bg-red-700 text-white" />
                    <Button value="÷" className="bg-orange-500 hover:bg-orange-600 text-white" />
                    <Button value="x" className="bg-orange-500 hover:bg-orange-600 text-white" />

                    <Button value="7" />
                    <Button value="8" />
                    <Button value="9" />
                    <Button value="-" className="bg-orange-500 hover:bg-orange-600 text-white" />
                    
                    <Button value="4" />
                    <Button value="5" />
                    <Button value="6" />
                    <Button value="+" className="bg-orange-500 hover:bg-orange-600 text-white" />

                    <Button value="1" />
                    <Button value="2" />
                    <Button value="3" />
                    <Button value="=" className="row-span-2 bg-blue-600 hover:bg-blue-700 text-white" />
                    
                    <Button value="0" className="col-span-2" />
                    <Button value="." />
                </div>
            </div>
        </div>
    );
};

export default CalculatorApp;