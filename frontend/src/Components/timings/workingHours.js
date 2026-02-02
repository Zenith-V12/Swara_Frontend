'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit2, Check, X, RefreshCcw } from 'lucide-react';
import {
    getAllWorkingHours,
    createWorkingHours,
    updateWorkingHours,
    getWorkingHoursByDateRange
} from '../../services/backendServices/workingHours';

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
            // Get working hours for the next 30 days
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + 30);

            const response = await getWorkingHoursByDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );

            console.log('📦 Working Hours Response:', response);
            setWorkingHours(response.data || []);
        } catch (err) {
            console.error('❌ Error fetching working hours:', err);
            setError(err.message || 'Failed to fetch working hours');
        } finally {
            setLoading(false);
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

            setWorkingHours(workingHours.map(entry =>
                entry._id === entryId ? { ...entry, ...editingEntry } : entry
            ));

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
        setNewEntry({
            ...newEntry,
            [field]: value
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
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

            setWorkingHours([response.data, ...workingHours].sort((a, b) => a.date.localeCompare(b.date)));
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
                        <p className="text-gray-400">
                            Manage your daily schedule and availability
                        </p>
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

                {/* Add New Entry Form */}
                {showAddForm && (
                    <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4">Add New Schedule</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newEntry.date}
                                        onChange={(e) => handleAddChange('date', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Day *
                                    </label>
                                    <select
                                        value={newEntry.day}
                                        onChange={(e) => handleAddChange('day', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Day</option>
                                        {daysOfWeek.map(day => (
                                            <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Workforce *
                                    </label>
                                    <input
                                        type="number"
                                        value={newEntry.workforce}
                                        onChange={(e) => handleAddChange('workforce', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="newIsClosed"
                                    checked={newEntry.isClosed}
                                    onChange={(e) => handleAddChange('isClosed', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="newIsClosed" className="text-sm text-gray-300">
                                    Closed on this day
                                </label>
                            </div>
                            {!newEntry.isClosed && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Start Time *
                                            </label>
                                            <input
                                                type="time"
                                                value={newEntry.start}
                                                onChange={(e) => handleAddChange('start', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                                required={!newEntry.isClosed}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                End Time *
                                            </label>
                                            <input
                                                type="time"
                                                value={newEntry.end}
                                                onChange={(e) => handleAddChange('end', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                                required={!newEntry.isClosed}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Break Start
                                            </label>
                                            <input
                                                type="time"
                                                value={newEntry.break_start}
                                                onChange={(e) => handleAddChange('break_start', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Break End
                                            </label>
                                            <input
                                                type="time"
                                                value={newEntry.break_end}
                                                onChange={(e) => handleAddChange('break_end', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleAddCancel}
                                    disabled={updatingEntry === 'new'}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingEntry === 'new'}
                                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {updatingEntry === 'new' ? 'Creating...' : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Create Schedule
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                            <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
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
                                                    <tr key={entry._id} className="hover:bg-gray-800 transition-colors">
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
                                                        <td className="px-6 py-4 text-sm">
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