'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ selectedDate, onDateSelect }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const formatDateForComparison = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const handleDateClick = (day) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateSelect(dateString);
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const isToday = (day) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        );
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return formatDateForComparison(selectedDate) === dateString;
    };

    // Create array of day objects
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return (
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Previous Month"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <h2 className="text-xl font-bold text-white">
                    {monthNames[month]} {year}
                </h2>
                
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Next Month"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const today = isToday(day);
                    const selected = isSelected(day);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`
                                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                                transition-all duration-200
                                ${selected
                                    ? 'bg-white text-black font-bold scale-105'
                                    : today
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Clear Selection Button */}
            {selectedDate && (
                <button
                    onClick={() => onDateSelect('')}
                    className="w-full mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                    Clear Selection
                </button>
            )}
        </div>
    );
}
