'use client';

import { useState, useEffect } from 'react';
import { CalendarRange, RefreshCcw, UsersRound } from 'lucide-react';
import { getAllBookings, getBookingsByStatus, getBookingsByDate, getBookingsByServiceFor, updateBooking } from '../../services/backendServices/bookings';

export default function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, confirmed, pending, cancelled
    const [selectedDate, setSelectedDate] = useState('');
    const [searchName, setSearchName] = useState('');
    const [editingTimes, setEditingTimes] = useState({}); // Track which booking times are being edited
    const [updatingBooking, setUpdatingBooking] = useState(null); // Track which booking is being updated
    const [editingFeedback, setEditingFeedback] = useState({}); // Track which booking feedback is being edited

    // Fetch bookings on component mount and when filters change
    useEffect(() => {
        fetchBookings();
    }, [filter, selectedDate, searchName]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        try {
            let response;

            console.log('🔍 Fetching bookings with filter:', filter, 'date:', selectedDate, 'name:', searchName);

            if (searchName.trim()) {
                response = await getBookingsByServiceFor(searchName.trim());
            } else if (selectedDate) {
                response = await getAllBookings({ date: selectedDate });
            } else if (filter !== 'all') {
                response = await getBookingsByStatus(filter);
            } else {
                response = await getAllBookings();
            }

            console.log('📦 Backend Response:', response);
            console.log('📊 Bookings Data:', response.data);
            console.log('📈 Number of bookings:', response.data?.length || 0);

            if (response.data && response.data.length > 0) {
                console.log('🎯 First booking sample:', response.data[0]);
            }

            setBookings(response.data || []);
        } catch (err) {
            console.error('❌ Error fetching bookings:', err);
            setError(err.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'bg-yellow-900 text-yellow-300 border-yellow-800',
            pending: 'bg-yellow-900 text-yellow-300 border-yellow-800',
            cancelled: 'bg-red-900 text-red-300 border-red-800',
            completed: 'bg-green-900 text-green-300 border-green-800',
            'no-show': 'bg-red-900 text-red-300 border-red-800',
        };
        return colors[status] || 'bg-gray-800 text-gray-400 border-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            confirmed: '✓',
            pending: '⏳',
            cancelled: '✕',
            completed: '✓',
            'no-show': '⚠',
        };
        return icons[status] || '•';
    };

    // Handle time editing
    const handleTimeEdit = (bookingId, startTime, endTime) => {
        setEditingTimes({
            ...editingTimes,
            [bookingId]: {
                start_time: startTime,
                end_time: endTime || '',
            }
        });
    };

    const handleTimeChange = (bookingId, field, value) => {
        setEditingTimes({
            ...editingTimes,
            [bookingId]: {
                ...editingTimes[bookingId],
                [field]: value,
            }
        });
    };

    const handleTimeSave = async (bookingId) => {
        setUpdatingBooking(bookingId);
        try {
            const times = editingTimes[bookingId];
            await updateBooking(bookingId, {
                startTime: times.start_time,
                endTime: times.end_time,
            });

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, start_time: times.start_time, end_time: times.end_time }
                    : booking
            ));

            // Clear editing state
            const newEditingTimes = { ...editingTimes };
            delete newEditingTimes[bookingId];
            setEditingTimes(newEditingTimes);

            console.log('✅ Booking time updated successfully');
        } catch (error) {
            console.error('❌ Error updating booking time:', error);
            alert('Failed to update booking time: ' + error.message);
        } finally {
            setUpdatingBooking(null);
        }
    };

    const handleTimeCancel = (bookingId) => {
        const newEditingTimes = { ...editingTimes };
        delete newEditingTimes[bookingId];
        setEditingTimes(newEditingTimes);
    };

    // Handle feedback editing
    const handleFeedbackEdit = (bookingId, feedback) => {
        setEditingFeedback({
            ...editingFeedback,
            [bookingId]: feedback || '',
        });
    };

    const handleFeedbackChange = (bookingId, value) => {
        setEditingFeedback({
            ...editingFeedback,
            [bookingId]: value,
        });
    };

    const handleFeedbackSave = async (bookingId) => {
        setUpdatingBooking(bookingId);
        try {
            const feedback = editingFeedback[bookingId];
            await updateBooking(bookingId, {
                feedback: feedback,
            });

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, feedback: feedback }
                    : booking
            ));

            // Clear editing state
            const newEditingFeedback = { ...editingFeedback };
            delete newEditingFeedback[bookingId];
            setEditingFeedback(newEditingFeedback);

            console.log('✅ Booking feedback updated successfully');
        } catch (error) {
            console.error('❌ Error updating booking feedback:', error);
            alert('Failed to update booking feedback: ' + error.message);
        } finally {
            setUpdatingBooking(null);
        }
    };

    const handleFeedbackCancel = (bookingId) => {
        const newEditingFeedback = { ...editingFeedback };
        delete newEditingFeedback[bookingId];
        setEditingFeedback(newEditingFeedback);
    };

    // Handle status change
    const handleStatusChange = async (bookingId, newStatus) => {
        setUpdatingBooking(bookingId);
        try {
            await updateBooking(bookingId, {
                status: newStatus,
            });

            // Update local state
            setBookings(bookings.map(booking =>
                booking._id === bookingId
                    ? { ...booking, status: newStatus }
                    : booking
            ));

            console.log('✅ Booking status updated successfully');
        } catch (error) {
            console.error('❌ Error updating booking status:', error);
            alert('Failed to update booking status: ' + error.message);
        } finally {
            setUpdatingBooking(null);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <CalendarRange className="w-8 h-8" />
                        All Bookings
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-gray-800">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Filter by Status
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setSelectedDate(''); // Clear date filter
                                }}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="all">All Bookings</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                                <option value="no-show">No Show</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setFilter('all'); // Clear status filter
                                }}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                        </div>

                        {/* Search by Name */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Search by Name
                            </label>
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => {
                                    setSearchName(e.target.value);
                                    setFilter('all'); // Clear status filter
                                    setSelectedDate(''); // Clear date filter
                                }}
                                placeholder="Enter customer name..."
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500"
                            />
                        </div>

                        {/* Clear Filters */}
                        {(filter !== 'all' || selectedDate || searchName) && (
                            <button
                                onClick={() => {
                                    setFilter('all');
                                    setSelectedDate('');
                                    setSearchName('');
                                }}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mt-7 border border-gray-700"
                            >
                                Clear Filters
                            </button>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={fetchBookings}
                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors mt-7 font-medium flex items-center gap-2"
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
                            onClick={fetchBookings}
                            className="mt-4 px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Bookings List */}
                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className="bg-gray-900 rounded-xl shadow-lg p-4 mb-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total Bookings</p>
                                    <p className="text-2xl font-bold text-white">{bookings.length}</p>
                                </div>
                                <UsersRound className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        {/* Bookings Table */}
                        {bookings.length === 0 ? (
                            <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    No Bookings Found
                                </h3>
                                <p className="text-gray-400">
                                    {selectedDate
                                        ? `No bookings for ${formatDate(selectedDate)}`
                                        : filter !== 'all'
                                            ? `No ${filter} bookings`
                                            : searchName
                                                ? `No bookings found for "${searchName}"`
                                                : 'No bookings available'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
                                {/* Table Header */}
                                <div className="bg-gray-800 border-b border-gray-700">
                                    <div className="grid gap-4 px-6 py-4 text-sm font-semibold text-gray-300" style={{ gridTemplateColumns: '1fr 1fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.8fr 1.5fr' }}>
                                        <div>Status</div>
                                        <div>Date</div>
                                        <div>Start Time</div>
                                        <div>End Time</div>
                                        <div>Customer</div>
                                        <div>Phone</div>
                                        <div>Service</div>
                                        <div>Booked By</div>
                                        <div>Feedback</div>
                                    </div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-gray-800">
                                    {bookings.map((booking) => {
                                        const isEditing = editingTimes[booking._id];
                                        const isUpdating = updatingBooking === booking._id;
                                        const isFeedbackEditing = editingFeedback[booking._id] !== undefined;

                                        return (
                                            <div
                                                key={booking._id}
                                                className="grid gap-4 px-6 py-4 hover:bg-gray-800 transition-colors items-center"
                                                style={{ gridTemplateColumns: '1fr 1fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.8fr 1.5fr' }}
                                            >
                                                {/* Status */}
                                                <div>
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                        disabled={isUpdating}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:ring-2 focus:ring-white focus:outline-none ${getStatusColor(booking.status)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        <option value="confirmed" className="bg-green-900 text-green-300">✓ CONFIRMED</option>
                                                        <option value="completed" className="bg-green-950 text-green-400">✓ COMPLETED</option>
                                                        <option value="no-show" className="bg-red-900 text-red-300">NO-SHOW</option>
                                                    </select>
                                                </div>

                                                {/* Date */}
                                                <div className="text-white text-sm">
                                                    {formatDate(booking.date)}
                                                </div>

                                                {/* Start Time */}
                                                <div className="text-white text-sm">
                                                    {isEditing ? (
                                                        <input
                                                            type="time"
                                                            value={editingTimes[booking._id].start_time}
                                                            onChange={(e) => handleTimeChange(booking._id, 'start_time', e.target.value)}
                                                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-white focus:border-transparent text-xs"
                                                            disabled={isUpdating}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
                                                            onClick={() => handleTimeEdit(booking._id, booking.start_time, booking.end_time)}
                                                        >
                                                            {formatTime(booking.start_time)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* End Time */}
                                                <div className="text-white text-sm">
                                                    {isEditing ? (
                                                        <div className="flex gap-1 items-center max-w-[140px]">
                                                            <input
                                                                type="time"
                                                                value={editingTimes[booking._id].end_time}
                                                                onChange={(e) => handleTimeChange(booking._id, 'end_time', e.target.value)}
                                                                className="flex-1 px-1 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-white focus:border-transparent text-xs"
                                                                disabled={isUpdating}
                                                            />
                                                            <button
                                                                onClick={() => handleTimeSave(booking._id)}
                                                                disabled={isUpdating}
                                                                className="px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50 flex-shrink-0"
                                                                title="Save"
                                                            >
                                                                {isUpdating ? '...' : '✓'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleTimeCancel(booking._id)}
                                                                disabled={isUpdating}
                                                                className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50 flex-shrink-0"
                                                                title="Cancel"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
                                                            onClick={() => handleTimeEdit(booking._id, booking.start_time, booking.end_time)}
                                                        >
                                                            {booking.end_time ? formatTime(booking.end_time) : '-'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Customer */}
                                                <div className="text-white text-sm font-medium">
                                                    {booking.service_for}
                                                </div>

                                                {/* Phone */}
                                                <div className="text-gray-300 text-sm">
                                                    {booking.user_phone}
                                                </div>

                                                {/* Service */}
                                                <div>
                                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium border border-gray-700">
                                                        Hair Cut
                                                    </span>
                                                </div>

                                                {/* Booked By */}
                                                <div className="text-gray-400 text-sm">
                                                    {booking.booked_by === booking.service_for
                                                        ? '-'
                                                        : booking.booked_by}
                                                </div>

                                                {/* Feedback */}
                                                <div className="text-white text-sm">
                                                    {isFeedbackEditing ? (
                                                        <div className="flex gap-1 items-center w-full">
                                                            <input
                                                                type="text"
                                                                value={editingFeedback[booking._id]}
                                                                onChange={(e) => handleFeedbackChange(booking._id, e.target.value)}
                                                                className="flex-1 min-w-0 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-white focus:border-transparent text-xs"
                                                                placeholder="Enter Feedback"
                                                                disabled={isUpdating}
                                                            />
                                                            <button
                                                                onClick={() => handleFeedbackSave(booking._id)}
                                                                disabled={isUpdating}
                                                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50 flex-shrink-0"
                                                                title="Save"
                                                            >
                                                                {isUpdating ? '...' : '✓'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeedbackCancel(booking._id)}
                                                                disabled={isUpdating}
                                                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50 flex-shrink-0"
                                                                title="Cancel"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={booking.feedback || ''}
                                                            onFocus={() => handleFeedbackEdit(booking._id, booking.feedback)}
                                                            readOnly
                                                            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 text-white rounded focus:ring-2 focus:ring-white focus:border-transparent text-xs cursor-pointer hover:bg-gray-700"
                                                            placeholder="Enter Feedback"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
