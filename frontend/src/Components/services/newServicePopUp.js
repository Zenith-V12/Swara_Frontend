import { Plus, X } from 'lucide-react';

export default function NewServicePopUp({
    isOpen,
    onClose,
    onSubmit,
    newService,
    onServiceChange,
    isCreating
}) {
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
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Add New Service</h2>
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
                                Service Title *
                            </label>
                            <input
                                type="text"
                                value={newService.title}
                                onChange={(e) => onServiceChange('title', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                placeholder="e.g., Hair Cut"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                value={newService.duration_mins}
                                onChange={(e) => onServiceChange('duration_mins', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                                placeholder="e.g., 30"
                                min="1"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={newService.description}
                            onChange={(e) => onServiceChange('description', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="Describe the service..."
                            rows="3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            value={newService.price}
                            onChange={(e) => onServiceChange('price', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="e.g., 500"
                            min="0"
                            step="0.01"
                            required
                        />
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
                                    Create Service
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
