
import React, { useState, useEffect } from 'react';

type UnitCategory = 'length' | 'weight' | 'temperature';

const MobiUnitConverterApp: React.FC = () => {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState('');
    const [toUnit, setToUnit] = useState('');
    const [fromValue, setFromValue] = useState<number | ''>('');
    const [toValue, setToValue] = useState<number | ''>('');

    const units: Record<UnitCategory, string[]> = {
        length: ['Meters', 'Kilometers', 'Inches', 'Feet', 'Miles'],
        weight: ['Kilograms', 'Grams', 'Pounds', 'Ounces'],
        temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    };

    useEffect(() => {
        setFromUnit(units[category][0]);
        setToUnit(units[category][1] || units[category][0]);
        setFromValue(''); setToValue('');
    }, [category]);

    const convert = (value: number, from: string, to: string, type: UnitCategory): number => {
        if (from === to) return value;
        if (type === 'length') {
            let meters = value;
            if (from === 'Kilometers') meters = value * 1000; if (from === 'Inches') meters = value * 0.0254; if (from === 'Feet') meters = value * 0.3048; if (from === 'Miles') meters = value * 1609.34;
            if (to === 'Meters') return meters; if (to === 'Kilometers') return meters / 1000; if (to === 'Inches') return meters / 0.0254; if (to === 'Feet') return meters / 0.3048; if (to === 'Miles') return meters / 1609.34;
        }
        if (type === 'weight') {
             let grams = value;
             if (from === 'Kilograms') grams = value * 1000; if (from === 'Pounds') grams = value * 453.592; if (from === 'Ounces') grams = value * 28.3495;
             if (to === 'Grams') return grams; if (to === 'Kilograms') return grams / 1000; if (to === 'Pounds') return grams / 453.592; if (to === 'Ounces') return grams / 28.3495;
        }
        if (type === 'temperature') {
            if (from === 'Celsius') { if (to === 'Fahrenheit') return (value * 9/5) + 32; if (to === 'Kelvin') return value + 273.15; }
            if (from === 'Fahrenheit') { if (to === 'Celsius') return (value - 32) * 5/9; if (to === 'Kelvin') return (value - 32) * 5/9 + 273.15; }
            if (from === 'Kelvin') { if (to === 'Celsius') return value - 273.15; if (to === 'Fahrenheit') return (value - 273.15) * 9/5 + 32; }
        }
        return value;
    };

    const handleFromChange = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) { setFromValue(''); setToValue(''); return; }
        setFromValue(num);
        const result = convert(num, fromUnit, toUnit, category);
        setToValue(parseFloat(result.toFixed(4)));
    };

    return (
        <div className="w-full h-full flex flex-col p-6 bg-[#121212] text-white font-sans">
            <h1 className="text-3xl font-normal mb-8 text-[#a8c7fa]">Converter</h1>
            
            <div className="flex justify-between mb-8 bg-[#303030] rounded-full p-1">
                {(['length', 'weight', 'temperature'] as UnitCategory[]).map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${category === cat ? 'bg-[#a8c7fa] text-[#041e49]' : 'text-gray-400'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                <div className="bg-[#1e1e1e] p-6 rounded-3xl">
                    <input type="number" value={fromValue} onChange={e => handleFromChange(e.target.value)} className="w-full bg-transparent text-5xl font-light mb-4 focus:outline-none" placeholder="0"/>
                    <select value={fromUnit} onChange={e => { setFromUnit(e.target.value); if (typeof fromValue === 'number') handleFromChange(fromValue.toString()); }} className="w-full bg-[#303030] text-gray-200 p-3 rounded-xl text-lg outline-none">
                        {units[category].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>

                <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#303030] flex items-center justify-center text-[#a8c7fa]">↓</div>
                </div>

                <div className="bg-[#1e1e1e] p-6 rounded-3xl border-2 border-[#303030]">
                    <div className="w-full bg-transparent text-5xl font-light mb-4 text-[#a8c7fa]">{toValue || '0'}</div>
                    <select value={toUnit} onChange={e => { setToUnit(e.target.value); if (typeof fromValue === 'number') handleFromChange(fromValue.toString()); }} className="w-full bg-[#303030] text-gray-200 p-3 rounded-xl text-lg outline-none">
                        {units[category].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default MobiUnitConverterApp;
