import React, { useState } from 'react';

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;

const CalendarApp: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    };

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-14 md:h-20 border border-transparent"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`h-14 md:h-20 border border-gray-200 dark:border-teal-700/30 flex flex-col items-start p-2 transition-colors relative
                        ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                        ${isSelected(day) ? 'ring-2 ring-inset ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-teal-700/20'}
                    `}
                >
                    <span className={`text-sm font-semibold ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}`}>{day}</span>
                </button>
            );
        }
        return days;
    };

    return (
        <div className="w-full h-full text-light-text dark:text-white flex flex-col">
            <div className="p-6 flex justify-between items-center bg-blue-600 text-white">
                <div>
                    <h2 className="text-3xl font-bold">{monthNames[month]} {year}</h2>
                    <p className="text-blue-100 cursor-pointer hover:underline mt-1" onClick={goToToday}>
                        Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors"><ChevronLeft /></button>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors"><ChevronRight /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 bg-gray-100 dark:bg-teal-950/50 text-center py-2 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-300 dark:border-teal-700/50">
                {dayNames.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 bg-white/50 dark:bg-teal-900/20 flex-grow">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default CalendarApp;
