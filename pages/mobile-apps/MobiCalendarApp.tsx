
import React, { useState } from 'react';

const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;

const MobiCalendarApp: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans relative">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <MenuIcon />
                    <span className="text-xl font-normal">{monthNames[month]}</span>
                </div>
                <div className="flex space-x-4">
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold" onClick={() => setCurrentDate(new Date())}>
                        {new Date().getDate()}
                    </button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-2">
                <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-sm">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === new Date().getDate() && month === new Date().getMonth();
                        return (
                            <div key={day} className="flex flex-col items-center justify-center h-10">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-[#0b57cf] text-white font-bold' : ''}`}>
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 px-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Schedule</h3>
                    <div className="flex space-x-4 mb-6">
                        <div className="flex flex-col items-center w-10">
                            <span className="text-xs text-gray-500">Mon</span>
                            <span className="text-lg font-bold">14</span>
                        </div>
                        <div className="flex-grow bg-[#c2e7ff] dark:bg-[#004a77] p-3 rounded-xl">
                            <div className="font-semibold text-[#001d35] dark:text-[#c2e7ff] text-sm">Project Review</div>
                            <div className="text-xs text-[#001d35]/70 dark:text-[#c2e7ff]/70">10:00 AM - 11:00 AM</div>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex flex-col items-center w-10">
                            <span className="text-xs text-gray-500">Tue</span>
                            <span className="text-lg font-bold">15</span>
                        </div>
                        <div className="flex-grow bg-[#e7f8ed] dark:bg-[#0f5223] p-3 rounded-xl">
                            <div className="font-semibold text-[#072711] dark:text-[#c4eed0] text-sm">Lunch with Team</div>
                            <div className="text-xs text-[#072711]/70 dark:text-[#c4eed0]/70">12:30 PM</div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="absolute bottom-6 right-6 w-14 h-14 bg-white dark:bg-[#303030] rounded-2xl shadow-xl flex items-center justify-center text-[#0b57cf] dark:text-[#a8c7fa]">
                <PlusIcon />
            </button>
        </div>
    );
};

export default MobiCalendarApp;
