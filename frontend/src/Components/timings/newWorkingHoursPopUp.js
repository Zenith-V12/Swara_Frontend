import { Plus, X } from 'lucide-react';

export default function NewWorkingHoursPopUp({
    isOpen,
    onClose,
    onSubmit,
    newEntry,
    onEntryChange,
    isCreating
}) {
    if (!isOpen) return null;

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Add New Schedule</h2>
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
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={newEntry.date}
                                onChange={(e) => onEntryChange('date', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Day *
                            </label>
                            <input
                                type="text"
                                value={newEntry.day ? newEntry.day.charAt(0).toUpperCase() + newEntry.day.slice(1) : ''}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
                                disabled
                                readOnly
                                placeholder="Auto-filled"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Workforce *
                            </label>
                            <input
                                type="number"
                                value={newEntry.workforce}
                                onChange={(e) => onEntryChange('workforce', e.target.value)}
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
                            onChange={(e) => onEntryChange('isClosed', e.target.checked)}
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
                                        onChange={(e) => onEntryChange('start', e.target.value)}
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
                                        onChange={(e) => onEntryChange('end', e.target.value)}
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
                                        onChange={(e) => onEntryChange('break_start', e.target.value)}
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
                                        onChange={(e) => onEntryChange('break_end', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </>
                    )}
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
                                    Create Schedule
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
                `}</style>
            </div>
        </div>
    );
}
