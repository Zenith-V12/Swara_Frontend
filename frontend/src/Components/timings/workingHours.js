'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit2, Check, X, RefreshCcw, Copy } from 'lucide-react';
import {
    getAllWorkingHours,
    createWorkingHours,
    updateWorkingHours,
    getWorkingHoursByDateRange,
    deleteWorkingHours,
    detectAffectedBookings
} from '../../services/backendServices/workingHours';
import NewWorkingHoursPopUp from './newWorkingHoursPopUp';

export default function WorkingHours() {
    const [workingHours, setWorkingHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [updatingEntry, setUpdatingEntry] = useState(null);
    const [newEntry, setNewEntry] = useState({
        date: '',
        day: '',
        isClosed: false,
        start: '',
        end: '',
        break_start: '',
        break_end: '',
        workforce: 0
    });

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        fetchWorkingHours();
    }, []);

    const fetchWorkingHours = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get working hours for the next 2 weeks only (14 days)
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + 14);

            const response = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );

            console.log('📦 Working Hours Response:', response);
            const fetchedHours = response.data || [];
            setWorkingHours(fetchedHours);
            
            // Auto-maintain removed - schedules are only created manually or via +7 day copy
        } catch (err) {
            console.error('❌ Error fetching working hours:', err);
            setError(err.message || 'Failed to fetch working hours');
        } finally {
            setLoading(false);
        }
    };

    const autoMaintainTwoWeekSchedule = async (currentWorkingHours) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysOfWeekArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            // Get all dates from today to 14 days ahead
            const next14Days = [];
            for (let i = 0; i <= 13; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                next14Days.push(date.toISOString().split('T')[0]);
            }

            // Find missing dates in the next 14 days
            const existingDates = new Set(currentWorkingHours.map(wh => wh.date));
            const missingDates = next14Days.filter(date => !existingDates.has(date));

            if (missingDates.length === 0) {
                console.log('✅ All dates in 2-week window already have schedules');
                return;
            }

            console.log(`📋 Auto-filling ${missingDates.length} missing dates in 2-week window`);

            // For each missing date, try to copy from 7 days ago
            for (const missingDate of missingDates) {
                const date = new Date(missingDate + 'T00:00:00');
                const sevenDaysAgo = new Date(date);
                sevenDaysAgo.setDate(date.getDate() - 7);
                const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0];

                // Find the schedule from 7 days ago
                const sourceSchedule = currentWorkingHours.find(wh => wh.date === sevenDaysAgoString);

                if (sourceSchedule) {
                    const dayName = daysOfWeekArray[date.getDay()];
                    
                    try {
                        await createWorkingHours({
                            date: missingDate,
                            day: dayName,
                            isClosed: sourceSchedule.isClosed,
                            start: sourceSchedule.isClosed ? null : sourceSchedule.start,
                            end: sourceSchedule.isClosed ? null : sourceSchedule.end,
                            break_start: sourceSchedule.isClosed ? null : sourceSchedule.break_start,
                            break_end: sourceSchedule.isClosed ? null : sourceSchedule.break_end,
                            workforce: sourceSchedule.workforce
                        });
                        console.log(`  ✅ Auto-created schedule for ${missingDate} based on ${sevenDaysAgoString}`);
                    } catch (error) {
                        // Silently skip if already exists or other error
                        if (error.message && error.message.includes('already exist')) {
                            console.log(`  ℹ️  Schedule for ${missingDate} already exists, skipping`);
                        } else {
                            console.log(`  ⚠️  Could not create schedule for ${missingDate}:`, error.message);
                        }
                    }
                }
            }

            // Refresh the working hours to show the new auto-created schedules
            const endDate = new Date();
            endDate.setDate(today.getDate() + 14);
            const refreshResponse = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            setWorkingHours(refreshResponse.data || []);
        } catch (error) {
            console.error('❌ Error in auto-maintain schedule:', error);
        }
    };

    const hasScheduleForTwoWeeks = (currentWorkingHours) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 13);
        
        // Count how many days have schedules in the next 14 days (today + 13)
        const futureDates = currentWorkingHours.filter(wh => {
            const whDate = new Date(wh.date + 'T00:00:00');
            return whDate >= today && whDate <= twoWeeksFromNow;
        });
        
        // If we have at least 14 days of schedule, we're full
        return futureDates.length >= 14;
    };

    const handleEditClick = (entry) => {
        setEditingEntry({
            _id: entry._id,
            date: entry.date,
            day: entry.day,
            isClosed: entry.isClosed,
            start: entry.start || '',
            end: entry.end || '',
            break_start: entry.break_start || '',
            break_end: entry.break_end || '',
            workforce: entry.workforce
        });
    };

    const handleEditChange = (field, value) => {
        setEditingEntry({
            ...editingEntry,
            [field]: value
        });
    };

    const handleEditSave = async (entryId) => {
        setUpdatingEntry(entryId);
        try {
            await updateWorkingHours(entryId, {
                date: editingEntry.date,
                day: editingEntry.day,
                isClosed: editingEntry.isClosed,
                start: editingEntry.isClosed ? null : editingEntry.start,
                end: editingEntry.isClosed ? null : editingEntry.end,
                break_start: editingEntry.isClosed ? null : editingEntry.break_start,
                break_end: editingEntry.isClosed ? null : editingEntry.break_end,
                workforce: parseInt(editingEntry.workforce)
            });

            const updatedWorkingHours = workingHours.map(entry =>
                entry._id === entryId ? { ...entry, ...editingEntry } : entry
            );
            setWorkingHours(updatedWorkingHours);

            // Detect and notify affected bookings
            try {
                console.log('🔍 Checking for affected bookings...');
                const result = await detectAffectedBookings([editingEntry.date]);
                if (result.data && result.data.affected_count > 0) {
                    console.log(`✅ Notified ${result.data.affected_count} affected booking(s)`);
                }
            } catch (detectError) {
                console.error('⚠️ Error detecting affected bookings:', detectError);
                // Don't fail the whole operation if detection fails
            }

            // Auto-copy the updated schedule to future weeks in sliding window
            const updatedEntry = updatedWorkingHours.find(e => e._id === entryId);
            if (updatedEntry) {
                await autoCopyToSlidingWindow(updatedEntry, updatedWorkingHours);
            }

            setEditingEntry(null);
            console.log('✅ Working hours updated successfully');
        } catch (error) {
            console.error('❌ Error updating working hours:', error);
            alert('Failed to update working hours: ' + error.message);
        } finally {
            setUpdatingEntry(null);
        }
    };

    const handleEditCancel = () => {
        setEditingEntry(null);
    };

    const handleAddChange = (field, value) => {
        const updates = { [field]: value };
        
        // Auto-populate day when date is selected
        if (field === 'date' && value) {
            const daysOfWeekArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const selectedDate = new Date(value + 'T00:00:00');
            const dayName = daysOfWeekArray[selectedDate.getDay()];
            updates.day = dayName;
        }
        
        setNewEntry({
            ...newEntry,
            ...updates
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        // Check if we already have 2 weeks of schedule
        if (hasScheduleForTwoWeeks(workingHours)) {
            alert('Cannot add more schedules. You already have schedules for the next 2 weeks. Please wait for the sliding window to move forward.');
            return;
        }

        setUpdatingEntry('new');

        try {
            const response = await createWorkingHours({
                date: newEntry.date,
                day: newEntry.day.toLowerCase(),
                isClosed: newEntry.isClosed,
                start: newEntry.isClosed ? null : newEntry.start,
                end: newEntry.isClosed ? null : newEntry.end,
                break_start: newEntry.isClosed ? null : newEntry.break_start,
                break_end: newEntry.isClosed ? null : newEntry.break_end,
                workforce: parseInt(newEntry.workforce)
            });

            const updatedWorkingHours = [response.data, ...workingHours].sort((a, b) => a.date.localeCompare(b.date));
            setWorkingHours(updatedWorkingHours);
            
            // Auto-copy this schedule to next week and week after (sliding window)
            await autoCopyToSlidingWindow(response.data, updatedWorkingHours);
            
            setNewEntry({
                date: '',
                day: '',
                isClosed: false,
                start: '',
                end: '',
                break_start: '',
                break_end: '',
                workforce: 0
            });
            setShowAddForm(false);
            console.log('✅ Working hours created successfully');
        } catch (error) {
            console.error('❌ Error creating working hours:', error);
            alert('Failed to create working hours: ' + error.message);
        } finally {
            setUpdatingEntry(null);
        }
    };

    const autoCopyToSlidingWindow = async (sourceEntry, currentWorkingHours) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysOfWeekArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            // Parse source date properly
            const [year, month, day] = sourceEntry.date.split('-').map(Number);
            const sourceDate = new Date(year, month - 1, day);  // month is 0-indexed
            
            // Copy to next week (7 days ahead) only
            const offset = 7;
            const targetDate = new Date(sourceDate);
            targetDate.setDate(targetDate.getDate() + offset);
            
            // Format as YYYY-MM-DD
            const targetYear = targetDate.getFullYear();
            const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
            const targetDay = String(targetDate.getDate()).padStart(2, '0');
            const targetDateString = `${targetYear}-${targetMonth}-${targetDay}`;
            
            // Only create if target date is within 14 days from today and doesn't exist
            const daysFromToday = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
            if (daysFromToday > 13) {
                console.log(`  ⚠️ Skipping ${targetDateString} - beyond 2-week window`);
                
                // Refresh and return
                const refreshEndDate = new Date();
                refreshEndDate.setDate(today.getDate() + 14);
                const refreshResponse = await getWorkingHoursByDateRange(
                    today.toISOString().split('T')[0],
                    refreshEndDate.toISOString().split('T')[0]
                );
                setWorkingHours(refreshResponse.data || []);
                return;
            }
            
            // Fetch latest data to check if it exists in DB
            const endDate = new Date();
            endDate.setDate(today.getDate() + 14);
            const checkResponse = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            const latestWorkingHours = checkResponse.data || [];
            
            const exists = latestWorkingHours.some(wh => wh.date === targetDateString);
            if (exists) {
                console.log(`  ⚠️ Skipping ${targetDateString} - already exists`);
                setWorkingHours(latestWorkingHours);
                return;
            }

            const dayName = daysOfWeekArray[targetDate.getDay()];
            
            try {
                await createWorkingHours({
                    date: targetDateString,
                    day: dayName,
                    isClosed: sourceEntry.isClosed,
                    start: sourceEntry.isClosed ? null : sourceEntry.start,
                    end: sourceEntry.isClosed ? null : sourceEntry.end,
                    break_start: sourceEntry.isClosed ? null : sourceEntry.break_start,
                    break_end: sourceEntry.isClosed ? null : sourceEntry.break_end,
                    workforce: sourceEntry.workforce
                });
                
                console.log(`  ✅ Auto-copied to ${targetDateString} (+7 days ahead)`);
            } catch (error) {
                // Silently skip if already exists or other error
                if (error.message && error.message.includes('already exist')) {
                    console.log(`  ℹ️  Schedule for ${targetDateString} already exists, skipping`);
                } else {
                    console.log(`  ⚠️  Could not create schedule for ${targetDateString}:`, error.message);
                }
            }
            
            // Refresh the list without triggering auto-maintain
            const finalEndDate = new Date();
            finalEndDate.setDate(today.getDate() + 14);
            const refreshResponse = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                finalEndDate.toISOString().split('T')[0]
            );
            setWorkingHours(refreshResponse.data || []);
        } catch (error) {
            console.error('❌ Error in auto-copy to sliding window:', error);
        }
    };

    const handleAddCancel = () => {
        setNewEntry({
            date: '',
            day: '',
            isClosed: false,
            start: '',
            end: '',
            break_start: '',
            break_end: '',
            workforce: 0
        });
        setShowAddForm(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-6 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Clock className="w-8 h-8" />
                            Working Hours
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchWorkingHours}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Schedule
                        </button>
                    </div>
                </div>

                {/* Add New Entry Modal */}
                <NewWorkingHoursPopUp
                    isOpen={showAddForm}
                    onClose={handleAddCancel}
                    onSubmit={handleAddSubmit}
                    newEntry={newEntry}
                    onEntryChange={handleAddChange}
                    isCreating={updatingEntry === 'new'}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-900 border border-red-800 rounded-2xl p-6 text-center">
                        <p className="text-red-300 text-lg">❌ {error}</p>
                        <button
                            onClick={fetchWorkingHours}
                            className="mt-4 px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Working Hours List */}
                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className="bg-gray-900 rounded-xl shadow-lg p-4 mb-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total Scheduled Days</p>
                                    <p className="text-2xl font-bold text-white">{workingHours.length}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        {/* Schedule Table */}
                        {workingHours.length === 0 ? (
                            <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    No Schedule Found
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Get started by adding your working hours
                                </p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Schedule
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-visible">
                                <div className="overflow-x-auto overflow-y-visible">
                                    <table className="w-full">
                                        <thead className="bg-gray-800 border-b border-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Day</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hours</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Break</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Workforce</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {workingHours.map((entry) => {
                                                const isEditing = editingEntry?._id === entry._id;
                                                const isUpdating = updatingEntry === entry._id;

                                                return (
                                                    <tr 
                                                        key={entry._id} 
                                                        className="hover:bg-gray-800 transition-colors overflow-visible"
                                                    >
                                                        <td className="px-6 py-4 text-sm text-white">
                                                            {formatDate(entry.date)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                                                            {entry.day}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {isEditing ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingEntry.isClosed}
                                                                    onChange={(e) => handleEditChange('isClosed', e.target.checked)}
                                                                    disabled={isUpdating}
                                                                    className="w-4 h-4"
                                                                />
                                                            ) : (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${entry.isClosed
                                                                    ? 'bg-red-900 text-red-300 border border-red-800'
                                                                    : 'bg-green-900 text-green-300 border border-green-800'
                                                                    }`}>
                                                                    {entry.isClosed ? 'Closed' : 'Open'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">
                                                            {isEditing && !editingEntry.isClosed ? (
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="time"
                                                                        value={editingEntry.start}
                                                                        onChange={(e) => handleEditChange('start', e.target.value)}
                                                                        disabled={isUpdating}
                                                                        className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs"
                                                                    />
                                                                    <span>-</span>
                                                                    <input
                                                                        type="time"
                                                                        value={editingEntry.end}
                                                                        onChange={(e) => handleEditChange('end', e.target.value)}
                                                                        disabled={isUpdating}
                                                                        className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                entry.isClosed ? '-' : `${entry.start} - ${entry.end}`
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">
                                                            {isEditing && !editingEntry.isClosed ? (
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="time"
                                                                        value={editingEntry.break_start}
                                                                        onChange={(e) => handleEditChange('break_start', e.target.value)}
                                                                        disabled={isUpdating}
                                                                        className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs"
                                                                    />
                                                                    <span>-</span>
                                                                    <input
                                                                        type="time"
                                                                        value={editingEntry.break_end}
                                                                        onChange={(e) => handleEditChange('break_end', e.target.value)}
                                                                        disabled={isUpdating}
                                                                        className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                entry.break_start && entry.break_end ? `${entry.break_start} - ${entry.break_end}` : 'No break'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    value={editingEntry.workforce}
                                                                    onChange={(e) => handleEditChange('workforce', e.target.value)}
                                                                    disabled={isUpdating}
                                                                    min="0"
                                                                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-gray-300">
                                                                    <Users className="w-4 h-4" />
                                                                    <span>{entry.workforce}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm relative overflow-visible">
                                                            {isEditing ? (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEditSave(entry._id)}
                                                                        disabled={isUpdating}
                                                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleEditCancel}
                                                                        disabled={isUpdating}
                                                                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditClick(entry)}
                                                                    disabled={isUpdating}
                                                                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}