import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllServices } from '../../services/backendServices/services';

export default function NewBookingPopUp({
    isOpen,
    onClose,
    onSubmit,
    newBooking,
    onBookingChange,
    isCreating
}) {
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Fetch services when popup opens
    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const response = await getAllServices();
            setServices(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    const handleServiceToggle = (serviceId) => {
        const currentIds = newBooking.serviceIds || [];
        const newIds = currentIds.includes(serviceId)
            ? currentIds.filter(id => id !== serviceId)
            : [...currentIds, serviceId];
        onBookingChange('serviceIds', newIds);
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with only blur - no dark overlay to show content behind */}
            <div
                className="absolute inset-0 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal with bounce animation */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in scrollbar-hide">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Add New Booking</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        type="button"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={newBooking.date}
                                onChange={(e) => onBookingChange('date', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Status *
                            </label>
                            <select
                                value={newBooking.status}
                                onChange={(e) => onBookingChange('status', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            >
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={newBooking.startTime}
                                onChange={(e) => onBookingChange('startTime', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                End Time *
                            </label>
                            <input
                                type="time"
                                value={newBooking.endTime}
                                onChange={(e) => onBookingChange('endTime', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Services *
                        </label>
                        {loadingServices ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        ) : services.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4">No services available</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-800 border border-gray-700 rounded-lg scrollbar-hide">
                                {services.map((service) => (
                                    <label
                                        key={service._id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={newBooking.serviceIds.includes(service._id)}
                                            onChange={() => handleServiceToggle(service._id)}
                                            className="w-4 h-4 rounded border-gray-600 text-white focus:ring-2 focus:ring-white"
                                        />
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-medium">{service.title}</div>
                                            <div className="text-gray-400 text-xs">
                                                {service.duration_mins} mins • ₹{service.price}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                            Select one or more services
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            value={newBooking.serviceFor}
                            onChange={(e) => onBookingChange('serviceFor', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Age *
                            </label>
                            <input
                                type="number"
                                value={newBooking.age}
                                onChange={(e) => onBookingChange('age', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                placeholder="e.g., 25"
                                min="1"
                                max="120"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gender *
                            </label>
                            <select
                                value={newBooking.gender}
                                onChange={(e) => onBookingChange('gender', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            value={newBooking.userPhone}
                            onChange={(e) => onBookingChange('userPhone', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="e.g., +919876543210"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Booked By (Optional)
                        </label>
                        <input
                            type="text"
                            value={newBooking.bookedBy}
                            onChange={(e) => onBookingChange('bookedBy', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="Leave empty if same as customer"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            If empty, will default to customer name
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreating ? 'Creating...' : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* CSS for bounce animation */}
                <style jsx>{`
                    @keyframes bounceIn {
                        0% {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        50% {
                            transform: scale(1.02);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    .animate-bounce-in {
                        animation: bounceIn 0.3s ease-out;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </div>
    );
}
