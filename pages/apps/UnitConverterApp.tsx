import React, { useState, useEffect } from 'react';

type UnitCategory = 'length' | 'weight' | 'temperature';

const UnitConverterApp: React.FC = () => {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState('');
    const [toUnit, setToUnit] = useState('');
    const [fromValue, setFromValue] = useState<number | ''>('');
    const [toValue, setToValue] = useState<number | ''>('');

    const units: Record<UnitCategory, string[]> = {
        length: ['Meters', 'Kilometers', 'Centimeters', 'Inches', 'Feet', 'Miles'],
        weight: ['Kilograms', 'Grams', 'Pounds', 'Ounces'],
        temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    };

    useEffect(() => {
        // Reset units when category changes
        setFromUnit(units[category][0]);
        setToUnit(units[category][1] || units[category][0]);
        setFromValue('');
        setToValue('');
    }, [category]);

    const convert = (value: number, from: string, to: string, type: UnitCategory): number => {
        if (from === to) return value;

        if (type === 'length') {
            // Convert to meters first
            let meters = value;
            if (from === 'Kilometers') meters = value * 1000;
            if (from === 'Centimeters') meters = value / 100;
            if (from === 'Inches') meters = value * 0.0254;
            if (from === 'Feet') meters = value * 0.3048;
            if (from === 'Miles') meters = value * 1609.34;

            // Convert from meters to target
            if (to === 'Meters') return meters;
            if (to === 'Kilometers') return meters / 1000;
            if (to === 'Centimeters') return meters * 100;
            if (to === 'Inches') return meters / 0.0254;
            if (to === 'Feet') return meters / 0.3048;
            if (to === 'Miles') return meters / 1609.34;
        }

        if (type === 'weight') {
             // Convert to grams first
             let grams = value;
             if (from === 'Kilograms') grams = value * 1000;
             if (from === 'Pounds') grams = value * 453.592;
             if (from === 'Ounces') grams = value * 28.3495;

             // Convert from grams to target
             if (to === 'Grams') return grams;
             if (to === 'Kilograms') return grams / 1000;
             if (to === 'Pounds') return grams / 453.592;
             if (to === 'Ounces') return grams / 28.3495;
        }

        if (type === 'temperature') {
            if (from === 'Celsius') {
                if (to === 'Fahrenheit') return (value * 9/5) + 32;
                if (to === 'Kelvin') return value + 273.15;
            }
            if (from === 'Fahrenheit') {
                if (to === 'Celsius') return (value - 32) * 5/9;
                if (to === 'Kelvin') return (value - 32) * 5/9 + 273.15;
            }
            if (from === 'Kelvin') {
                if (to === 'Celsius') return value - 273.15;
                if (to === 'Fahrenheit') return (value - 273.15) * 9/5 + 32;
            }
        }

        return value;
    };

    const handleFromChange = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
            setFromValue('');
            setToValue('');
            return;
        }
        setFromValue(num);
        const result = convert(num, fromUnit, toUnit, category);
        setToValue(parseFloat(result.toFixed(4)));
    };

    // Handle swapping units
    const handleSwap = () => {
        const tempUnit = fromUnit;
        setFromUnit(toUnit);
        setToUnit(tempUnit);
        if (typeof toValue === 'number') {
             setFromValue(toValue);
             // Recalculate reversed to avoid slight precision drift if any
             const result = convert(toValue, toUnit, tempUnit, category); 
             setToValue(parseFloat(result.toFixed(4)));
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-dark-bg text-light-text dark:text-white">
            <div className="w-full max-w-3xl mx-auto">
                <h1 className="text-5xl font-bold mb-12 text-center">Unit Converter</h1>
                
                <div className="flex justify-center space-x-2 mb-10 bg-black/5 dark:bg-black/20 p-1 rounded-lg">
                    {(['length', 'weight', 'temperature'] as UnitCategory[]).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-8 py-4 rounded-md capitalize font-medium text-xl transition-colors ${category === cat ? 'bg-white dark:bg-teal-600 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xl font-medium opacity-70">From</label>
                        <div className="flex space-x-4">
                            <input 
                                type="number" 
                                value={fromValue} 
                                onChange={e => handleFromChange(e.target.value)}
                                className="flex-grow bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-4 text-4xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter value"
                            />
                            <select 
                                value={fromUnit} 
                                onChange={e => { setFromUnit(e.target.value); if (typeof fromValue === 'number') handleFromChange(fromValue.toString()); }}
                                className="w-1/3 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-4 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {units[category].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={handleSwap} className="p-4 rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-blue-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xl font-medium opacity-70">To</label>
                        <div className="flex space-x-4">
                             <input 
                                type="number" 
                                value={toValue} 
                                readOnly
                                className="flex-grow bg-gray-200 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-md px-4 py-4 text-4xl font-semibold focus:outline-none"
                                placeholder="Result"
                            />
                            <select 
                                value={toUnit} 
                                onChange={e => { setToUnit(e.target.value); if (typeof fromValue === 'number') handleFromChange(fromValue.toString()); }}
                                className="w-1/3 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-4 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {units[category].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitConverterApp;