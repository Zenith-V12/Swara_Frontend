'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Edit2, Check, X, RefreshCcw } from 'lucide-react';
import {
    getAllWorkingHours,
    createWorkingHours,
    updateWorkingHours,
    getWorkingHoursByDateRange,
    deleteWorkingHours,
    detectAffectedBookings
} from '../../services/backendServices/workingHours';

export default function WorkingHours() {
    const [workingHours, setWorkingHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [updatingEntry, setUpdatingEntry] = useState(null);

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        initializeSchedule();
    }, []);

    const initializeSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            await deletePastEntries();
            await ensureTwoWeekSchedule();
            await fetchWorkingHours();
        } catch (err) {
            console.error('❌ Error initializing schedule:', err);
            setError(err.message || 'Failed to initialize schedule');
        } finally {
            setLoading(false);
        }
    };

    const deletePastEntries = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // We need to fetch all or a wide range to find past entries. 
            // Assuming getAllWorkingHours or a range from a long time ago.
            // For safety, let's look back 1 year.
            const pastDate = new Date(today);
            pastDate.setFullYear(today.getFullYear() - 1);

            // We only need to check up to yesterday
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            const response = await getWorkingHoursByDateRange(
                pastDate.toISOString().split('T')[0],
                yesterday.toISOString().split('T')[0]
            );

            const pastEntries = response.data || [];

            if (pastEntries.length > 0) {
                console.log(`🗑️ Found ${pastEntries.length} past entries to delete`);
                // deleting sequentially to avoid overwhelming the server if many
                for (const entry of pastEntries) {
                    await deleteWorkingHours(entry._id);
                }
                console.log('✅ Past entries deleted');
            }
        } catch (error) {
            console.error('❌ Error deleting past entries:', error);
            // We continue even if deletion fails, to ensure current schedule is shown
        }
    };

    const ensureTwoWeekSchedule = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 0 to 13 (14 days)
            const requiredDates = [];
            for (let i = 0; i < 14; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                requiredDates.push(d.toISOString().split('T')[0]);
            }

            // Check what we already have in this range
            const response = await getWorkingHoursByDateRange(
                requiredDates[0],
                requiredDates[requiredDates.length - 1]
            );

            const existingEntries = response.data || [];
            // Ensure we are comparing same format (YYYY-MM-DD)
            const existingDates = new Set(existingEntries.map(e => e.date.split('T')[0]));

            const missingDates = requiredDates.filter(d => !existingDates.has(d));

            if (missingDates.length > 0) {
                console.log(`✨ Creating schedule for ${missingDates.length} missing days`);

                for (const dateStr of missingDates) {
                    try {
                        const dateObj = new Date(dateStr + 'T00:00:00');
                        const dayName = daysOfWeek[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1]; // getDay 0 is Sunday

                        // Default schedule: 09:00 - 17:00, Workforce: 1, Open
                        await createWorkingHours({
                            date: dateStr,
                            day: dayName,
                            isClosed: false,
                            start: '09:00',
                            end: '20:00',
                            break_start: '',
                            break_end: '',
                            workforce: 3
                        });
                    } catch (createError) {
                        // Silently skip if already exists or other error
                        console.log(`⚠️ Could not create schedule for ${dateStr}:`, createError.message);
                    }
                }
                console.log('✅ Missing schedules creation process completed');
            }
        } catch (error) {
            console.error('❌ Error ensuring 2-week schedule:', error);
            // We don't throw here to ensure the page still loads existing data
        }
    };

    const fetchWorkingHours = async () => {
        // Just fetch the relevant range now
        try {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + 14);

            const response = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );

            setWorkingHours(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching working hours:', error);
            throw error;
        }
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
                        <p className="text-gray-400 text-sm">
                            Schedule is automatically maintained for the next 14 days. Past dates are removed.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={initializeSchedule}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

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
                            onClick={initializeSchedule}
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
                                    The system should have auto-generated your schedule. Try refreshing.
                                </p>
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